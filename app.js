const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const telegram = require('./telegram');
const aws = require('./aws');
const url = 'https://hoops.co.il/';

let params;
let previousPosts = []; // = params.previousPosts;
let maxNumOfPreviousPosts = 200;

exports.handler = async function (event, context) {
    await run();
    return 'success';
  }

async function run() {
    params = await aws.getParams('hoops');
    telegram.setOptions(params);
    previousPosts = params.previousPosts;
    await checkValue();
}

async function checkValue() {
    try {
        await new Promise(async (resolve, reject) => { JSDOM.fromURL(
            url, {}).then(async dom => {
                let articles = dom.window.document.getElementById('blog-entries')?.children;
                let numOfPosts = articles?.length;
                let id, title, description, url, posts = [];
                for (let i = 0; i < numOfPosts; i++) {
                    id = parseInt(articles[i].id.replace('post-', ''));
                    title = articles[i]?.getElementsByClassName('blog-entry-title')[0]?.children[0]?.getAttribute('title');
                    description = articles[i]?.getElementsByClassName('blog-entry-summary')[0]?.children[0]?.innerHTML?.replace('\n', '');
                    url = articles[i]?.getElementsByClassName('thumbnail-link')[0]?.getAttribute('href');
                    if (id && title && description && url) posts.push({ id, title, description, url });
                }
                posts = posts.filter(filterNewPosts);
                let sortedPosts = posts.sort(sortPosts());
                for (let i = 0; i < sortedPosts.length; i++) {
                    await telegram.send(`🆕 ${sortedPosts[i].title}\n\n${sortedPosts[i].description.trim()}\n${sortedPosts[i].url}`);
                    previousPosts.push(sortedPosts[i].id);
                }
                previousPosts.sort().reverse();
                while (previousPosts.length > maxNumOfPreviousPosts)
                    previousPosts.pop();
                await aws.putParams('hoops', JSON.stringify({ telegramToken: params.telegramToken, chatId:params.chatId, previousPosts }));
                resolve('success');
            });
        });
    }
    catch (ex) {
        console.log('General error');
        console.log(ex);
    }
}

function filterNewPosts(post) {
    return previousPosts.length > 0 && !previousPosts.includes(post.id);
}

function sortPosts() {
    return function (postA, postB) {
        if (postA.id > postB.id) return 1;
        return -1;
    }
}