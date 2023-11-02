# React Open Movie Database 

This simple react program uses the [Open Movie Database](https://www.omdbapi.com/) to allow you to search for movies, and build a list of movies that you have seen with your own ratings for them.

This app was constructed as part of the  [Ultimate React Course](https://www.udemy.com/course/the-ultimate-react-course/) on Udemy.com by [Jonas Schmedtmann. It 

## React Features Demonstrated
Basic React Features Including:
 * React Components
 * passing props to react components 
 *  useState to save local state for the app
 * useEffect hook to fetch movieData from the omdbApi 

## Setup and Running

In order to run this app you will need the following

1. Install [Node.js](https://nodejs.org/en) for local development. 

2. run npm install in the app folder

3. Obtain an OMDB key as described below and place it in a src/secrets.json file.

4. run npm start in the app folder

5. open a local browser at http://localhost:3000

   
## OMDB Api Key
The Open Movie Database requires you to have an API key to access their database.  For security, this key is not part of the GitHub project, but instead you will need to obtain your own key and create a src/secrets.json file to hold the key as described below. 

You will need to create a free account to obtain the following key as described at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). 

Once you have your key, place it in a plaintext file at "/src/secrets.json" with the contents as follows:

```
{
  "omdbApiKey" : "1a2a3a4a"
}
```

This approach of using a secrets file was found [here](https://blog.netwrix.com/2022/11/14/how-to-hide-api-keys-github/).  There are more advanced ways documented on GitHub at [GtHub-Keeping Your Api Credentials Secure](https://docs.github.com/en/rest/overview/keeping-your-api-credentials-secure?apiVersion=2022-11-28)

# Create-React-App Readme 

This app was bootstrapped using ```npx create-reac-app@5 projectName```The default readme for react apps is found at [ReadmeReact.md](./ReadmeReact.md)

### Markdown Syntax

This file is a Markdown file, which is a plaintext file that can be rendered into HTML and is capable of containing hyperlinks, images, tables and other formatting syntax.  See the [GitHub Document Writing](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) page for more information. 



