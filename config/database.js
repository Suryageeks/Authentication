const mongoose = require('mongoose')
const { MONGODB_URI } = process.env

exports.connect = () => {
    mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology:true
    })
    .then(console.log('DB CONNECTION SUCCESSFULLY'))
    .catch(error => {
        console.log('DB CONNECTION FAILED');
        console.log(error);
        process.exit(1);
    })
}