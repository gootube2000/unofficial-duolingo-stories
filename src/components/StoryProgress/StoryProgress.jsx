import React from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

import styles from "./StoryProgress.module.css";
import StoryChallengeMultipleChoice from "../StoryChallengeMultipleChoice";
import StoryChallengeContinuation from "../StoryChallengeContinuation";
import StoryChallengeMatch from "../StoryChallengeMatch";
import StoryChallengeArrange from "../StoryChallengeArrange";
import StoryChallengePointToPhrase from "../StoryChallengePointToPhrase";
import StoryChallengeSelectPhrases from "../StoryChallengeSelectPhrases";
import FadeGlideIn from "../FadeGlideIn";
import StoryTextLine from "../StoryTextLine";
import StoryHeader from "../StoryHeader";
import ProgressBar from "../ProgressBar";
import StoryFooter from "../StoryFooter";
import StoryFinishedScreen from "../StoryFinishedScreen";
import StoryTitlePage from "../StoryTitlePage";
import VisuallyHidden from "../VisuallyHidden";

function getComponent(parts) {
  if (parts[0].type === "HEADER") return Header;
  if (parts[0].trackingProperties?.challenge_type === "arrange")
    return StoryChallengeArrange;
  if (
    parts[parts.length - 1].trackingProperties?.challenge_type ===
    "point-to-phrase"
  )
    return StoryChallengePointToPhrase;
  if (
    parts[parts.length - 1].trackingProperties?.challenge_type ===
    "multiple-choice"
  )
    return StoryChallengeMultipleChoice;
  if (parts[0].trackingProperties?.challenge_type === "continuation")
    return StoryChallengeContinuation;
  if (parts[0].trackingProperties?.challenge_type === "select-phrases")
    return StoryChallengeSelectPhrases;
  if (parts[0].trackingProperties?.challenge_type === "match")
    return StoryChallengeMatch;

  return Line;
}

function Header({ parts, active, hidden, setButtonStatus, settings }) {
  if (active) setButtonStatus("continue");

  return (
    <FadeGlideIn hidden={hidden}>
      <StoryHeader active={active} element={parts[0]} settings={settings} />
    </FadeGlideIn>
  );
}

function Line({ parts, active, hidden, setButtonStatus, settings }) {
  if (active) setButtonStatus("continue");
  return (
    <FadeGlideIn hidden={hidden}>
      <StoryTextLine active={active} element={parts[0]} settings={settings} />
    </FadeGlideIn>
  );
}

function GetParts(story) {
  const parts = [];
  let last_id = -1;
  for (let element of story.elements) {
    if (element.trackingProperties === undefined) {
      continue;
    }
    if (last_id !== element.trackingProperties.line_index) {
      parts.push([]);
      last_id = element.trackingProperties.line_index;
    }
    if (
      element.type === "MULTIPLE_CHOICE" &&
      parts.at(-1).length > 1 &&
      element.trackingProperties.challenge_type === "multiple-choice"
    )
      parts.push([]);
    parts[parts.length - 1].push(element);
  }
  for (let i = 0; i < parts.length; i++) {
    for (let j = 0; j < parts[i].length; j++) {
      parts[i][j].trackingProperties.line_index = i;
    }
  }
  return parts;
}

function getCharacter(parts) {
  for (let element of parts) {
    const value = element?.line?.characterName || element?.line?.characterId;
    if (value) return value;
  }
}

function StoryProgress({ story, parts_list, settings, onEnd, ...args }) {
  if (story) {
    parts_list = GetParts(story);
  }
  const [partProgress, setPartProgress] = React.useState(0);
  const [storyProgress, setStoryProgress] = React.useState(
    settings?.show_title_page ? -1 : 0,
  );
  const [buttonStatus, setButtonStatus] = React.useState(
    storyProgress === -1 ? "continue" : "wait",
  );

  async function next() {
    if (buttonStatus === "finished") {
      setButtonStatus("...");
      await onEnd();
      return;
    }
    if (buttonStatus === "wait") return;
    if (buttonStatus === "idle") {
      setButtonStatus("wait");
      return setPartProgress(partProgress + 1);
    }
    if (buttonStatus === "continue" || buttonStatus === "right") {
      setPartProgress(0);
      setStoryProgress(storyProgress + 1);
      if (storyProgress === parts_list.length - 1) setButtonStatus("finished");
      else setButtonStatus("wait");
    }
  }

  function getIndex(parts) {
    return parts[0].trackingProperties.line_index || 0;
  }

  const part_list_with_component = [];
  const character_list = ["Narrator"];
  for (let parts of parts_list) {
    const character = getCharacter(parts);
    if (character && !character_list.includes(character)) {
      character_list.push(character);
    }
    const hidden = !(storyProgress >= getIndex(parts) || settings.show_all);
    if (1) {
      //storyProgress >= getIndex(parts) || settings.show_all) {
      if (
        settings.hide_questions &&
        parts[0].trackingProperties?.challenge_type === "match"
      )
        continue;
      part_list_with_component.push({
        parts,
        id: getIndex(parts),
        hidden,
        Component: getComponent(parts),
      });
    }
  }

  return (
    <>
      <div>
        {!settings.show_all && (
          <HeaderProgress
            course_short={story.course_short}
            progress={storyProgress}
            length={storyProgress === -1 ? undefined : parts_list.length}
          />
        )}
        {storyProgress === -1 && !settings.show_all && (
          <StoryTitlePage story={story} next={next} />
        )}
        <div className={styles.story} data-rtl={settings.rtl}>
          {settings.show_names && (
            <>
              <NameButtons
                character_list={character_list}
                highlight_name={settings.highlight_name}
                setHighlightName={settings.setHighlightName}
                setHideNonHighlighted={settings.setHideNonHighlighted}
              />
              <h1>{story.from_language_name}</h1>
            </>
          )}
          <AnimatePresence>
            {part_list_with_component.map(
              ({ Component, id, parts, hidden }) => {
                const active =
                  storyProgress === getIndex(parts) && !settings.show_all;
                return (
                  <Component
                    key={id}
                    parts={parts}
                    partProgress={partProgress}
                    setButtonStatus={
                      active
                        ? setButtonStatus
                        : () => console.log("not allowed")
                    }
                    active={active}
                    settings={settings}
                    hidden={hidden}
                    {...args}
                  ></Component>
                );
              },
            )}
          </AnimatePresence>
          <div className={styles.spacer}></div>
          {storyProgress === parts_list.length && (
            <StoryFinishedScreen story={story} />
          )}
        </div>
        {!settings.show_all && storyProgress !== -1 && (
          <StoryFooter buttonStatus={buttonStatus} onClick={next} />
        )}
      </div>
    </>
  );
}

function HeaderProgress({ course_short, progress, length }) {
  return (
    <div className={styles.header}>
      <Link
        className={styles.header_close}
        data-cy="quit"
        href={`/${course_short}`}
      >
        <VisuallyHidden>Back to Course Page</VisuallyHidden>
      </Link>
      {length !== undefined && (
        <ProgressBar progress={progress} length={length} />
      )}
    </div>
  );
}

function NameButtons({
  character_list,
  highlight_name,
  setHighlightName,
  setHideNonHighlighted,
}) {
  return (
    <>
      <div className={styles.characterSelector}>
        {character_list.map((character) => (
          <button
            key={character}
            onClick={() => {
              if (highlight_name.includes(character)) {
                const newList = highlight_name.filter((v) => v != character);
                setHighlightName(newList);
              } else {
                const newList = [...highlight_name, character];
                setHighlightName(newList);
              }
            }}
          >
            {character}
          </button>
        ))}
        <button onClick={() => setHideNonHighlighted((i) => !i)}>
          Hide Others
        </button>
      </div>
    </>
  );
}

export default StoryProgress;
