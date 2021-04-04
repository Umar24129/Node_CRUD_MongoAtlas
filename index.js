const express = require('express')

const app = express()
app.use(express.json())
const db = require('./database/Dbmongocloud')

const multer = require('multer')
const path = require('path')
const fs = require('fs')


let storage = multer.diskStorage({
    destination: (req, file, cb) => {


        cb(null, './Images')
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        console.log("test ext = " + ext)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG') {
            return cb(new Error("Only Images are allowed to be added"))
        } else cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))


    }
})

const upload = multer({ storage: storage }).array('usr', 20)






app.post('/addNewService', async (req, res) => {

    upload(req, res, async (err) => {
        if (err) {
            console.log(`upload  error: ${err}`);
            return res.send({ messae: "Failed to upload Image due to some error" })

        }
        else {

            let filepath = []    //filepath is an array having path of all images.

            for (let i = 0; i < req.files.length; i++) {

                filepath.push(req.files[i].path)
            }

            //data is the key gien to the text
            //supposing all rest of the JSON body is with key "data"
            let body = JSON.parse(req.body.data)
            let bodyImageObj = {
                _id: body._id,
                Title: body.Title,
                Description: body.Description,
                Price: body.Price,
                Location: body.Location,
                Images: filepath
            }
            console.log(bodyImageObj)
            const result = await db.addnewService(bodyImageObj)
            res.send(result)



        }
    })


})

app.delete('/delServiceByID', async (req, res) => {
    let id = req.body._id
    let result = await db.delSerByIdMongo(id)
    res.send(result)

})

app.get('/fetchAllServiceByIDsearch', async (req, res) => {
    if (Object.keys(req).length === 0) {
        res.send({ message: "Missing id" })
    }
    console.log("test" + req.query.ID)
    let IDtoSearch = req.query.ID
    let result = await db.fetchAllByIDsearchMongo(IDtoSearch)
    res.send(result)

})


app.put('/uPdateSerByAnyfield', async (req, res) => {
    //expecting front end to send complete object with modified docs so using replaceOnefunction of Mongo
    //if not then this could be done via if and else statament
    //Also expecting id cannot be modified

    let updatebody = req.body
    console.log(updatebody)
    let result = await db.updSerEditFldByID(updatebody)
    res.send(result)

})


app.get('/fetchAllServicesSearch', async (req, res) => {

    console.log("test")
    let bodyofPost = req.query.search
    let x = ""
    let y = " Dang"
    console.log(bodyofPost)
    const result = await db.fetchAllserviceSearch(bodyofPost)
    res.send(result)

})

const port = process.env.PORT || 2000
app.listen(port, () => {
    console.log("WhatsUpp")
})
