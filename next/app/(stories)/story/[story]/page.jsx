import React from "react";

import query from "lib/db";

import StoryWrapper from "./story_wrapper";


export async function get_story(story_id) {
    let res = await query(`SELECT l1.short AS fromLanguage, l2.short AS learningLanguage, 
              l1.name AS fromLanguageLong, l2.name AS learningLanguageLong, 
              l1.rtl AS fromLanguageRTL, l2.rtl AS learningLanguageRTL,
              story.id, story.json 
              FROM story 
              JOIN course c on story.course_id = c.id 
              LEFT JOIN language l1 ON l1.id = c.fromLanguage
              LEFT JOIN language l2 ON l2.id = c.learningLanguage 
              WHERE story.id = ?;`, story_id);
    if (res.length === 0) {
        //result.sendStatus(404);
        return
    }
    let data = JSON.parse(res[0]["json"]);
    data.id = res[0]["id"];

    data.fromLanguage = res[0]["fromLanguage"];
    data.fromLanguageLong = res[0]["fromLanguageLong"];
    data.fromLanguageRTL = res[0]["fromLanguageRTL"];

    data.learningLanguage = res[0]["learningLanguage"];
    data.learningLanguageLong = res[0]["learningLanguageLong"];
    data.learningLanguageRTL = res[0]["learningLanguageRTL"];

    return data;
}

/*
        <Head>
            <title>{`Duostories ${story.learningLanguageLong} from ${story.fromLanguageLong}: ${story.fromLanguageName}`}</title>
            <link rel="canonical" href={`https://www.duostories.org/story/${story.id}`} />
        </Head>
 */
export default async function Page({params}) {
    const story = await get_story(params.story);

    return <>
        <StoryWrapper story={story} />
    </>
}