import { checkForNonExisting } from "./api/checkusernames";
import { store } from "./api/storeusernames";
import { find } from "./api/find";
import { storeTweet } from "./api/storetweets";
import { sendMsgToOpenAI } from "./service/openai";

console.log("Hello via Bun!");

let prod = "localhost"
if (prod.includes("localhost")) {
    prod = 8080
} else {
    prod = ""
}

Bun.serve({
    port: prod,
    async fetch(req) {
        const res = new Response("Twitter")
        const url = new URL(req.url)
        if (url.pathname == "/twitter") {
            const usernames = url.searchParams.get("username")
            const usernameArray = usernames.split(",")
            let parsedUsernameArray = []
            let usernamesToInsertList = []
            let IDsToInsertList = []
            usernameArray.forEach((at) => {
                parsedUsernameArray.push(at.split("@")[1])
                console.log("Parsed username array: ", parsedUsernameArray)
            })
            console.log("Username array: ", usernameArray)
            const nonExistingIDs = await checkForNonExisting(parsedUsernameArray)
            const existingIDs = await find(parsedUsernameArray)
            console.log("Non existing usernames in db: ", nonExistingIDs[0])
            console.log("decoded username: ", usernameArray[0])

            //calls twitter api for every non existing username
            async function callTwitterApi(e) {
                const response = await fetch(`https://api.twitter.com/2/users/by/username/${e}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.BEARER_TOKEN}`
                    }
                })
                const responseBody = await response.json()
                console.log("Inside callTwitter function: ", responseBody)
                usernamesToInsertList.push(responseBody.data.username)
                IDsToInsertList.push(responseBody.data.id)
                return ( { username: usernamesToInsertList, id: IDsToInsertList } )
            }

           /* usernameArray.forEach((e) => {
                //check if username has /
                let usernameToCall = e
                if (e.includes("/")) {
                    usernameToCall = e.split("\\")[0]
                    console.log(usernameToCall)
                }
                callTwitterApi(usernameToCall)
            }) */

            //store username with id in db
            const ids = await store(usernamesToInsertList, IDsToInsertList) //returns stored ids of stored usernames
            //call twitter api for recent tweets 
            const tweetResponse = await fetch(`https://api.twitter.com/2/users/${existingIDs[0]}/tweets`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${process.env.BEARER_TOKEN}`
                }
            })
            console.log(tweetResponse)
            const tweetBody = await tweetResponse.json().text
            //ask chatgpt for now
            const aiResponse = await sendMsgToOpenAI(tweetBody)
            console.log("Tweet body: ", tweetBody)
            console.log("AI response: ", aiResponse)
            return new Response(aiResponse)
        } if (url.pathname == "/ai-test") {
            const usernames = url.searchParams.get("username")
            const usernameArray = usernames.split(",")
            let parsedUsernameArray = []
            let usernamesToInsertList = []
            let IDsToInsertList = []
            if (usernameArray[0].includes("@")) {
                usernameArray.forEach((at) => {
                    parsedUsernameArray.push(at.split("@")[1])
                    console.log("Parsed username array: ", parsedUsernameArray)
                })
            }
            const nonExistingIDs = await checkForNonExisting(parsedUsernameArray) //returns non existing
            console.log("Non existing IDs in DB: ", nonExistingIDs[0])
            let existingUsers = await find(parsedUsernameArray) //returns all
            console.log("Existing in DB: ", existingUsers)

            //calls twitter api for every non existing username
            async function callTwitterApi(e) {
                const response = await fetch(`https://api.twitter.com/2/users/by/username/${e}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.BEARER_TOKEN}`
                    }
                })
                const responseBody = await response.json()
                console.log("Inside callTwitter function: ", responseBody)
                usernamesToInsertList.push(responseBody.data.username)
                IDsToInsertList.push(responseBody.data.id)
                console.log(`IDs to insert list and usernames to instert list: ${IDsToInsertList} and ${usernamesToInsertList}`)
                return ( { _id: IDsToInsertList[0], username: usernamesToInsertList[0] } )
            }

            //if no existingUsers call twitterapi:
            if (!existingUsers) {
                /*usernameArray.forEach((e) => {
                //check if username has /
                let usernameToCall = e
                if (e.includes("/")) {
                    usernameToCall = e.split("\\")[0]
                    console.log(usernameToCall)
                }
                callTwitterApi(usernameToCall)
                }) */
                existingUsers = await callTwitterApi(parsedUsernameArray[0])
            }

            //const returnToClient = await callTwitterApi(usernameToCall)
            //store username with id in db
            //const ids = await store(usernamesToInsertList, IDsToInsertList) //returns stored ids of stored usernames
            //call twitter api for recent tweets 
            const tweetResponse = await fetch(`https://api.twitter.com/2/users/${existingUsers[0]._id}/tweets`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${process.env.BEARER_TOKEN}`
                }
            })
            const tweetBody = await tweetResponse.json().text
            console.log("Twitter API tweet body reponse: ", tweetBody)
            //we should also store this in database
            storeTweet(existingUsers[0]._id, existingUsers[0].username, tweetBody)
            //ask chatgpt for now
            const aiResponse = await sendMsgToOpenAI(tweetBody)
            //const aiResponse = await sendMsgToOpenAI("if you want to go to space, you're a little to full of yourself says one who sings songs about her exes and their new rides for bunch of 16 year old girls")
            //wait for stream to finish
            const parsedAiResponse = JSON.stringify(aiResponse)
            const allowedOrigin = req.headers.get("origin").includes("localhost") ? "http://localhost:5173" : "https://analysooorfrontend.vercel.app"
            if (req.method === "OPTIONS") {
                return new Response(parsedAiResponse, {
                    headers: {
                        "Access-Control-Allow-Origin": "http://localhost:5173",
                        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    }
                });
            }
            return new Response(parsedAiResponse, {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Content-Type": "application/json"
                }
            })
        } else {
            console.log("Twitter not hit")
            return new Response("Error");
        }
    },
  });