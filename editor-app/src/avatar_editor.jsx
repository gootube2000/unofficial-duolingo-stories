import React from 'react';
import {useDataFetcher, useDataFetcher2, useEventListener} from './hooks'
import {Spinner} from './react/spinner'
import {Flag} from './react/flag'
import {useUsername, Login, LoginDialog} from './login'
import {useInput} from "./hooks";
import {getAvatars, getSpeakers, setAvatarSpeaker} from "./api_calls.mjs";
import "./avatar_editor.css"

function Avatar(props) {
    let avatar = props.avatar;
    let [inputName, inputNameSetValue] = useInput(avatar.name || "");
    let [inputSpeaker, inputSpeakerSetValue] = useInput(avatar.speaker || "");
    let language_id = props.language_id;
    function save() {
        let data = {
            name: inputName,
            speaker: inputSpeaker,
            language_id: language_id,
            avatar_id: avatar.avatar_id,
        };
        setAvatarSpeaker(data)
    }
    if(avatar.avatar_id === 0) {
        return <div className={"avatar"}>
            <p>{avatar.avatar_id}</p>
            <p style={{width: "50px", height: "66.6px"}}>
                <img src={avatar.link} style={{width: "50px"}}/>
            </p>

            <p>{inputName}</p>
            <p><input value={inputSpeaker} onChange={inputSpeakerSetValue} type="text" placeholder="Speaker"/></p>
            <p><input value="save" onClick={save} disabled={(inputName && inputName === avatar.name && inputSpeaker && inputSpeaker === avatar.speaker) ? true : false} type="button"/></p>
        </div>
    }
    return <div className={"avatar"}>
        <p>{avatar.avatar_id}</p>
        <p>
            <img src={avatar.link} style={{width: "50px"}}/>
        </p>

        <p><input value={inputName} onChange={inputNameSetValue} type="text" placeholder="Name"/></p>
        <p><input value={inputSpeaker} onChange={inputSpeakerSetValue} type="text" placeholder="Speaker"/></p>
        <p><input value="save" onClick={save} disabled={(inputName && inputName === avatar.name && inputSpeaker && inputSpeaker === avatar.speaker) ? true : false} type="button"/></p>
    </div>
}

export function AvatarNames(props) {
    let urlParams = new URLSearchParams(window.location.search);
    const [language, setLanguage] = React.useState(parseInt(urlParams.get("language")) || undefined);
    const [avatars, _] = useDataFetcher2(getAvatars, [language]);
    const [speakers, __] = useDataFetcher2(getSpeakers, [language]);

    let images = [];
    let avatars_new = [];
    let avatars_new_important = [];
    if(avatars !== undefined)
    for(let avatar of avatars) {
        if(images.indexOf(avatar.link) === -1) {
            if([0, 414, 415, 416, 418, 507, 508, 509, 592, 593].indexOf(avatar.avatar_id) !== -1)
                avatars_new_important.push(avatar);
            else
                avatars_new.push(avatar);
            images.push(avatar.link)
        }
    }

    if(avatars === undefined || speakers === undefined || language === undefined)
        return <Spinner/>
    return <>
    <div className="speaker_list">
        <table id="story_list" className="js-sort-table js-sort-5 js-sort-desc" data-js-sort-table="true">
            <thead>
            <tr>
                <th style={{borderRadius: "10px 0 0 0"}} data-js-sort-colnum="0">Name</th>
                <th data-js-sort-colnum="1">Gender</th>
                <th style={{borderRadius: "0 10px 0 0"}} data-js-sort-colnum="2">Type</th>
            </tr>
            </thead>
            <tbody>
        {speakers.map((speaker, index) =>
            <tr key={index}>
                <td>{speaker.speaker}</td>
                <td>{speaker.gender}</td>
                <td>{speaker.type}</td>
            </tr>
        )}
            </tbody>
        </table>
    </div>
    <div className={"avatar_editor"} style={{"overflow-y": "scroll"}}>
        {avatars_new_important.map((avatar, index) =>
            <Avatar key={index} language_id={language} avatar={avatar} />
        )}
        {avatars_new.map((avatar, index) =>
            <Avatar key={index} language_id={language} avatar={avatar} />
        )}
    </div>
    </>
}

