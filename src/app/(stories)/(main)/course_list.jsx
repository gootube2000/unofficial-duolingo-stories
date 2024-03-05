import React, { Suspense } from "react";
import get_localisation from "lib/get_localisation";
import LanguageButton from "./language_button";

import styles from "./course_list.module.css";
import styles0 from "./layout.module.css";
import Legal from "../../../components/layout/legal";
import { get_course_groups, get_courses_in_group } from "./get_course_data";
import FooterLinks from "./footer_links";

async function LanguageGroup({ name, tag, id }) {
  let courses_list = await get_courses_in_group(id);

  let localisation = await get_localisation(id);

  if (!courses_list) return <>no list {name}</>;

  return (
    <div className={styles.course_list}>
      <hr />
      <div className={styles.course_group_name}>
        {localisation("stories_for")}
      </div>
      <ol className={styles.course_list_ol}>
        {courses_list?.map((course) => (
          <li key={course.id}>
            <LanguageButton course_id={course.short} />
          </li>
        ))}

        {courses_list?.map((course) => (
          <li key={course.id}>
            <LanguageButton course_id={course.short} />
          </li>
        ))}

        {courses_list?.map((course) => (
          <li key={course.id}>
            <LanguageButton course_id={course.short} />
          </li>
        ))}
      </ol>
    </div>
  );
}

async function CourseListInner({ loading, tag }) {
  if (loading) {
    return (
      <div className={styles.course_list}>
        <hr />
        <div className={styles.course_group_name}>
          <span className={styles.loading}>Stories for English Speakers</span>
        </div>
        <ol className={styles.course_list_ol}>
          {[...Array(10)].map((d, i) => (
            <li key={i}>
              <LanguageButton loading={true} />
            </li>
          ))}
        </ol>
      </div>
    );
  }
  let course_groups = await get_course_groups();
  return (
    <>
      {course_groups?.map((group) => (
        <LanguageGroup
          key={group.from_language}
          name={group.from_language_name}
          id={group.from_language}
          tag={tag}
        />
      ))}
    </>
  );
}

export default async function CourseList({ tag }) {
  return (
    <Suspense fallback={<CourseListInner loading={true} />}>
      <CourseListInner tag={tag} />
    </Suspense>
  );
}
