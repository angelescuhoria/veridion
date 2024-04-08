# Veridion Challange #1

First things first, this is not a finalized project, tried various solutions to fix some issues (which I'll discuss later), but in the end (and also being overdue) I gave it my best shot and I'd say that even if I haven't fully finished it, I've learned a lot anyways.
Let's take this chronologically.

## Tech stack
I've chosen my stack to be NodeJS, Express, ReactJS. Of course, running on TypeScript. I chose to run a Python script to identify the addresses in the text extracted, due to reasons I'll explain later.

### Backend
It's pretty simple, I have an api endpoint where I get all the data from. Initially I wanted to make a file containing the relevant data to send to the frontend but towards the end, I realized that it's not necessary.

### Frontend
It's the basic React boilerplate as the backend is not even providing the relevant data. If I was to manage it, I would add a search option to surf through all of the options and display the relevant data accordingly.

## Implementation
1. First thins first, I had to read the contents inside the parquet file. I've done so using the *parquets* npm library, inside the "getDomains" function. Given the file contained ~2500 domains, and the fact that I had to search for addresses in every page, in every domain, I had to think about how can I improve the process time. And so, I've resorted to methods such as multi-threading and workers using *threadsJS* and *workers* respectively. Using *Puppeteer*, I've managed to extract all the text from all pages. Using efficiency and web crawling, I've gathered all data in a single object, having the domain as the key and an array containing all the text from all pages as the value of it.
2. Now that I have the data, all is left is to extract the address blocks and then split it according to the problem at hand. The data is sent from Node to the Python script using *PythonShell* and then sent back to Node through a basic print. By using a python NLP library, I've managed to extract *some* addresses.
3. Last step would've been to send the data to the Frontend, where it is fetched using *React Query* and should've been displayed in a grid based layout with a search box on top. Other idea I had in mind was to display ALL companies and their addresses using a "procedural loading" method for performance reasons.

## Issues faced & Workarounds
1. The first thing that came up as an obstacle was websites that no longer exist, or domains that have no site attatched to them. And for these domains, I've resorted to a simple empty array to which I would've displayed a message on the Frontend that the company has no valid address.
2. Being held back by computer resources. Even if I have a high end computer, looping through so many domains and extracting all the data would be a *very* slow process so I've initially resorted to the first 10 domains, but then changed to 1 for debug/testing purposes (e.g. to see if my python script worked)
3. I wanted to extract all text from these websites because, even though, usually the address (or addresses in some cases) is found in the footer of the page, or in the "contact us" section, some websites displayed their addresses in different areas. Besides this, there was no "general rule" in which tag these addresses were located in. I couldn't search for a specific HTML tag to further reduce process time. Other websites would include their address in 2 or more tags, instead of 1 tag, so I had to combine the strings into a single one.
4. The main problems, in terms of difficulty and time consumed:
   - Finding a way to web crawl. I initially wanted to use *crawlee* to get the text, but *Puppeteer* already has a built-in crawler to get text. Then I had to process the text so it's returned without any "\n"s or unnecessary empty spaces.
   - **Trying to extract the address from the processed text**. Initial thought was *RegEx* but that is unreliable. After that, I've tried using NLP libraries for JavaScript such as *compromise*. I've toyed with it for a day or two but it turned out to be unreliable as well. The way it works is it places tags around each word so I'd want to use these tags to get my data, but it doesn't find addresses at all as it looks word by word and not block by block (of text). Finally, I got to use Python because I know most ML/AI codes are written in Python and so there should be a "more reliable" NLP library in there. I've been using *usaddress*. Testing it on US addresses worked almost flawlessly, I only had to process a little bit of data. It workes based on patterns so it recognizes addresses pretty well. Exceptions might be where there would be 2 or more numbers in a sequence as this library might interpret it as an address, but these exceptions are short (length wise) and can be dealt with, with a single *if statement* as addresses are not very short.
   - **Trying to send the data from Node to Python and back**. This is the part that took me the most out of my time. For the most part, I sent the whole JSON over to the python script getting the *ENAMETOOLONG* error. Last day I had an idea of sending the string values inside the arrays, one by one, so I wouldn't get the error anymore. As of this writing, now I'm faced with *UnicodeEncodeError* within PythonShell. I also tried other methods from PythonShell docs to send/receive data but no luck. I've also tried other libraries such as *child-process*, but again, didn't work.
   - Error 500 when creating a pool of workers? I had this error occur for a day, tried to look for a fix, didn't find any. Next day I open up the server and now it suddenly works. I don't know how I feel about this to be honest...

## Final Thoughts
In the end, it's something that I've never done before. So I had to research and understand how a lot of these things work. Even though I couldn't make it to the end, I've definetely learned a lot and I've enjoyed the process. I know I was a bit overdue, but I did try my best to come up with a good solution.
