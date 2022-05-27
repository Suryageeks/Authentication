require('dotenv').config()
require('./config/database').connect()
const express = require('express')
const User = require('./model/user')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')

const app = express()
app.use(express.json())
app.use(cookieParser())



app.get('/' , (req , res)=>{

   res.send("<h1>Hello from auth system</h1>")

})

app.post('/register', async (req, res) => {
   try {
   const { firstname, lastname, email, password } = req.body
   //custom strategy 
   if (!(email && password && firstname && lastname)) {
      res.status(400).send('All Fields are required')
   }

   const existingUser = await User.findOne({ email })  //PROMISE
   
   if (existingUser) {
      res.status(401).send('User Already Exist')
   }

   const myEncryptPassword = await bcrypt.hash(password, 10)
   
   const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password:myEncryptPassword
   })

   //token
   const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
         expiresIn:'2h'
      }
   )
   user.token = token
   //update or not in DB

   //handle password situation so that it doesnt show up in postman or frontend
   user.password = undefined
   
   //send token or send just success yes and redirect can be done in frontend   
   res.status(201).json(user)
   }
   catch (error){
      console.log(error)
   }

})

app.post('/login',async (req, res) => {
   try {
      const { email, password } = req.body
      if (!(email && password)) {
         res.status(400).send("Fields are Missing")
      }

      const user = await User.findOne({ email })
      
      // if (!user) {
      //    res.status(400).send("Not register in our app")
      // }

      if (user && (await bcrypt.compare(password, user.password))) {
         // to create a token
         const token = jwt.sign(
            { user_id: user._id, email },
            process.env.SECRET_KEY,
            {
               expiresIn:"3h"
            }
         )

         user.token = token
         user.password = undefined
         // res.status(200).json(user)

         //if we want to use cookies
         const options = {
            expires: new Date(
               Date.now() + 3 * 24 * 60 * 60 * 100
            ),
            httpOnly: true
         }

         res.status(200).cookie('token', token, options).json({
            success: true,
            token,
            user
         })
      }

      res.send(400).send("email or password is incorrect")
   }
   catch (error) {
      console.log(error)
   }
})

app.get('/dashboard', auth ,(req, res) => {
   res.send('SECRET INFORMATION')
})

app.get('/logout',auth, (req, res) => {
   res.clearCookie('token').status(200).send('Cookie is cleared and logout successfull')
})
module.exports = app
