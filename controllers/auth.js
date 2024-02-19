const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');



exports.register = async (req, res) => {
    const user = req.body
    
    const usernameT = await User.findOne({username: user.username})

    if (usernameT){
        res.status(422).json({message : "Username already exist"})
    } else {
        const newUser = new User({
            username: user.username,
            password: user.password,
            image: req.file.filename
        })
        newUser.save()
        res.status(200).json({message: "Success"})
    }
}




exports.login = async (req, res) => {
    const user = req.body
    const usernameT = await User.findOne({username: user.username})
    if(usernameT){
        await usernameT.comparePassword(user.password).then(
            match => {
                if(match){
                    const payload = {
                        id: usernameT._id,
                        username: usernameT.username,
                        image: usernameT.image
                    }
                    
                    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:86400}, (err, token) => {
                        if (err) return res.status(422).json({message: err})
                        return res.status(200).json({
                            token: token,
                            user: payload
                        })
                    })

                } else {
                    return res.status(422).json({message: "Invalid password"})
                }
            }
        )
    } else {
        return res.status(422).json({message: "Invalid username"})
    }
    
}


exports.profile = async (req, res, next) => {
    try {
        await User.findOne({username:req.params.username})
                    .select('_id username imaage')
                    .exec()
                    .then(docs => {
                        res.status(200).json(docs)
                    })
                    .catch(err => {
                        res.status(404).json({error:err})
                    })


    } catch (error) {
        res.status(500).json({error:error})
    }
}

exports.getUser = async (req, res, next) => {
    try {
        await User.findById(new mongoose.Types.ObjectId(req.params._id))
                    .select('_id username image')
                    .exec()
                    .then(docs => {
                        res.status(200).json(docs)
                    })
                    .catch(err => {
                        res.status(404).json({error:err})
                    })


    } catch (error) {
        res.status(500).json({error:error})
    }
}



exports.updateUser = async (req, res) => {
    try {
      const { id, username, image } = req.body;
      
      // Find the user by ID
      const user = await User.findById(new mongoose.Types.ObjectId(id))
                                .select('_id username image')
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Update the username and/or image if provided
      if (username) {
        user.username = username;
      }
      if (req.file) {
        user.image = req.file.filename;
      }
  
      // Save the updated user
      await user.save();
  
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
