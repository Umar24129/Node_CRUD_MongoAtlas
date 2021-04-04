const MongoClient = require("mongodb").MongoClient;

const uri = "";  //add monodb srv to ur own cluster on mongo atlas



let con

async function connect(service) {
    if (con) return con
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    con = client.connect()
    return con
}


async function addnewService(service) {
    const client = await connect()
    const database = client.db("servicedb")
    const usr = await database.collection("serCollections").find({ _id: service._id }).toArray()
    if (usr.length >= 1) {

        return { message: "ID already in use" }
    }
    else {
        const result = await database.collection("serCollections").insertOne(service)

        return { message: "Service Added to Database" }
    }

}



async function delSerByIdMongo(id) {
    const client = await connect()
    const database = client.db("servicedb")
    let result = await database.collection('serCollections').deleteOne({ _id: id })
    if (result.error) {
        return { message: "Some error occured" }
    }
    else if (result.result.n !== 1) {
        return { message: "Service ID not found" }
    }
    else {
        return { message: "Services with ID " + id + " have been deleted" }
    }
}

async function fetchAllByIDsearchMongo(service) {
    const client = await connect()
    const database = client.db("servicedb")
    const usr = await database.collection("serCollections").find({ _id: service }).toArray()

    if (usr.length < 1) {
        return { message: "No record Found" }
    } else if (usr.error) {
        return { message: "Some Error" }
    } else {
        return usr
    }

}

async function updSerEditFldByID(updateBody) {
    const client = await connect()
    const database = client.db("servicedb")
    const result = await database.collection("serCollections").replaceOne({ _id: updateBody._id }, updateBody)

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        return { message: "No changes made to the collection." }
    }
    else if (result.modifiedCount === 1) {
        return { message: "Updated one document." }
    }

}


async function fetchAllserviceSearch(service) {
    const client = await connect()
    const database = client.db("servicedb")

    await database.collection("serCollections").createIndex({ _id: "text", Title: "text", Description: "text", Price: "text", Location: "text" })

    const query = { $text: { $search: service } };
    const projection = {
        _id: 1,
        Title: 1,
        Description: 1,
        Price: 1,
        Location: 1,
        textScore: {
            $meta: "textScore"
        }

    }
    let recipesCursor = await database.collection("serCollections").find(query).project(projection)
    let recipe = []
    while (await recipesCursor.hasNext()) {
        recipe.push(await recipesCursor.next())

        console.log(recipe)
    }
    if (recipe.length >= 1) {
        return (recipe)
    }
    else {
        return { message: "No Match Found" }
    }
}


module.exports = {
    addnewService,
    delSerByIdMongo,
    fetchAllByIDsearchMongo,
    updSerEditFldByID,
    fetchAllserviceSearch
}






