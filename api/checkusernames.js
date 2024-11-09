import { connectToDatabase } from "../service/mongodb"

export async function checkForNonExisting(usernames) {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("Twitter Users")
        const retrievedUsernames = await collection.find( { username: { $in: usernames } } ).toArray()
        const existingUsernames = retrievedUsernames.map((e) => e.username)
        const usernamesNotInDb = usernames.filter((e) => !existingUsernames.includes(e))
        return usernamesNotInDb
    } catch (error) {
        throw error
    }
}