import { connectToDatabase } from "../service/mongodb"

export async function store(usernames, ids) {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("Twitter Users")
        console.log(usernames)
        const insertDocuments = usernames.map((username, id) => ({
            _id: ids[id],
            username: username
        }))
        console.log("Insert Documents: ", insertDocuments)
        //await collection.insertMany(insertDocuments)
        await collection.insertOne( { _id: ids[0], username: usernames[0] } )
        return ids
    } catch (error) {
        throw error
    }
}