const test = require("ava");
const { knex } = require("../../database");
const topicModel = require(".");
const weekModel = require("../week");
const instructorModel = require("../instructor");

test.beforeEach(async () => {
  // Clear the weeks and topics tables before each test so we don't have to worry about reinserting the same id
  // We have to clear the week table because topic depends on week
  await knex(topicModel.TOPIC_TABLE_NAME).del();
  await knex(weekModel.WEEK_TABLE_NAME).del();
  await knex(instructorModel.INSTRUCTOR_TABLE_NAME).del();
  await knex(instructorModel.INSTRUCTOR_TABLE_NAME).insert({ id: 1, name: "Sampat" })
  await knex(weekModel.WEEK_TABLE_NAME).insert({ number: 1, name: "Week #1", instructor_id: 1 });
});

test.serial("insertForWeek > Returns the inserted topic", async (t) => {
  t.plan(4);
  // We setup the test by inserting a topic to the database
  const result = await topicModel.insertForWeek(1, "HTML & CSS");
  t.is(result.length, 1, "Must return one item");

  const insertedItem = result[0];
  t.true(
    insertedItem.id && insertedItem.id.length === 36,
    "Must generate an id of 36 characters in length (which is the standard for UUID used by Postgres)"
  );
  const expectedResult = { week_number: 1, name: "HTML & CSS" };
  t.is(
    insertedItem.week_number,
    expectedResult.week_number,
    "Must have correct week number"
  );
  t.is(insertedItem.name, expectedResult.name, "Must have correct name");
});

test.serial(
  "insertForWeek > Throws when trying to insert a topic for a non existent week",
  async (t) => {
    t.plan(1);
    await t.throwsAsync(
      () => topicModel.insertForWeek(2, "HTML & CSS"),
      { instanceOf: Error },
      "Must throw if we try to insert a topic for a non existent week"
    );
  }
);

test.serial(
  "updateTopicById > Returns the updated topic",
  async (t) => {
    t.plan(1);
    const result = await topicModel.insertForWeek(1, "HTML & CSS");
    const updateditem = await topicModel.updateTopicById(result[0].id, { name: "HTML&JAVA", week_number: 1 });
    const expectedResult = [{ id: result[0].id, name: "HTML&JAVA", week_number: 1 }];
    t.deepEqual(
      updateditem,
      expectedResult,
      "Must be updated"
    );
  });

test.serial("updateTopicById > Updates a topic",
  async (t) => {
    await topicModel.insertForWeek(1, "HTML & CSS")
    const dbQuery = await knex(topicModel.TOPIC_TABLE_NAME).where(
      "week_number",
      1
    )
    const result = await topicModel.updateTopicById(dbQuery[0].id, { name: "HTML&JAVA" })
    const expectedResult = await knex(topicModel.TOPIC_TABLE_NAME).where(
      "week_number",
      1
    )
    t.deepEqual(
      result,
      expectedResult,
      "Must return updated values by id")
  });

test.serial(
  "searchTopicWithWeekData > Returns topics matching the passed string",
  async (t) => {
    t.plan(1);
    await topicModel.insertForWeek(1, "HTML & CSS")
    const dbQuery = await knex(topicModel.TOPIC_TABLE_NAME).where(
      "week_number",
      1
    )
    const searcheditem = await topicModel.searchTopicWithWeekData("HTML");
    const expectedResult = [{ id: dbQuery[0].id, week_name: 'Week #1', week_number: 1, name: "HTML & CSS", }];
    t.deepEqual(
      searcheditem,
      expectedResult,
      "Must return the topic with matching result"
    );
  });

test.serial(
  "searchTopicWithWeekData > Returns empty array if no topics match the query",
  async (t) => {
    await topicModel.insertForWeek(1, "HTML & CSS")
    const result = await topicModel.searchTopicWithWeekData("haha")
    const expectedResult = []
    t.deepEqual(
      result,
      expectedResult,
      "Must return empty not matching topics of the passed argument")
  }
);

test.serial("deleteTopicById > Deletes the topic whose id is passed as an argument",
  async (t) => {
    await topicModel.insertForWeek(1, "HTML & CSS")
    const dbQuery = await knex(topicModel.TOPIC_TABLE_NAME).where(
      "week_number",
      1
    )
    const result = await topicModel.deleteTopicById(dbQuery[0].id)
    const expectedResult = 1;
    t.deepEqual(
      result,
      expectedResult,
      "Must return inserted object in an array")
  });

test.todo(
  "insertForWeek > Topics are actually inserted in the database"
);
test.todo("deleteTopicById > Does not throw when deleting non-existent topic");
