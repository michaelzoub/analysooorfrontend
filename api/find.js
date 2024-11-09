import { connectToDatabase } from "../service/mongodb"

export async function find(usernames) {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("Twitter Users")
        const retrievedUsers = await collection.find( { username: { $in: usernames } } ).toArray()
        console.log(retrievedUsers)
        return retrievedUsers
    } catch (error) {
        throw error
    }
}