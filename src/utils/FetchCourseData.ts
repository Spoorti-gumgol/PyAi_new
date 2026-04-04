// utils/fetchCourseData.ts

import { supabase } from "../supabase";
import { Topic, Lesson } from "../types/course";

export const fetchTopicsWithLessons = async (unitId: string): Promise<Topic[]> => {
  // 1. Fetch topics for this course
  const { data: topicsData, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true });

  if (topicsError) throw new Error(`Topics fetch failed: ${topicsError.message}`);
  if (!topicsData || topicsData.length === 0) return [];

  // 2. Extract topic IDs for the lessons query
  const topicIds = topicsData.map((t) => t.id);

  // 3. Fetch all lessons belonging to those topics
  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .in("topic_id", topicIds)
    .order("order_index", { ascending: true });

  if (lessonsError) throw new Error(`Lessons fetch failed: ${lessonsError.message}`);

  // 4. Group lessons by topic_id using a Map for O(1) lookups
  const lessonsByTopic = new Map<string, Lesson[]>();

  topicIds.forEach((id) => lessonsByTopic.set(id, []));

  (lessonsData ?? []).forEach((lesson: Lesson) => {
    const existing = lessonsByTopic.get(lesson.topic_id);
    if (existing) existing.push(lesson);
  });

  // 5. Merge topics with their lessons
  const topics: Topic[] = topicsData.map((topic) => ({
    ...topic,
    lessons: lessonsByTopic.get(topic.id) ?? [],
  }));

  return topics;
};