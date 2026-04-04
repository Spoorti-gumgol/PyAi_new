export type Lesson = {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  order_index: number;
};

export type Topic = {
  id: string;
  unit_id: string;
  name: string;
  order_index: number;
  parent_topic_id: string | null;
  lessons: Lesson[];
};