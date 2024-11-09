import { connectToDatabase } from "../service/mongodb";

export async function storeTweet(id, username, tweetBody) {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("Tweets")  
        await collection.insertOne( { _id: id, username: username, text: tweetBody } )
        return "Success"
    } catch (error) {
        return error
    }
}