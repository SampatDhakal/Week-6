const test = require('ava');
const { knex } = require('../../database');
const instructorModel = require('./index')
const weekModel = require('../week/index')

test.beforeEach(async () => {
    await knex(instructorModel.INSTRUCTOR_TABLE_NAME).del();
    await knex(weekModel.WEEK_TABLE_NAME).del();
})

test.serial("insertinstructor > Insert values of instructor",
    async (t) => {
        const result = await instructorModel.insertInstructor(1, "Sampat");
        const expectedResult = [{ id: result[0].id, name: 'Sampat' }];
        t.deepEqual(
            result,
            expectedResult,
            'Must insert values for instrutor'
        )
    }
)

test.serial('insertInstructors > Insert values for more than one instructor',
    async (t) => {
        const result = await instructorModel.insertInstructors([
            { id: 1, name: 'Sampat' },
            { id: 2, name: 'Ratish' }
        ]);
        const expectedResult = [{ id: 1, name: 'Sampat' }, { id: 2, name: 'Ratish' }];
        t.deepEqual(
            result,
            expectedResult,
            'Must insert array of instructors'
        )
    }
)

test.serial('searchInstructorById > Searches instructor using id',
    async (t) => {
        await instructorModel.insertInstructor(1, "Sampat");
        const result = await instructorModel.searchInstructorById(1);
        const expectedResult = [{ id: 1, name: 'Sampat' }];
        t.deepEqual(
            result,
            expectedResult,
            'Must search instructor by id'
        )
    }
)

test.serial('updateInstructorById > Updates value instructor by id',
    async (t) => {
        await instructorModel.insertInstructor(1, "Sampat");
        const result = await instructorModel.updateInstructorById(1, { id: 2, name: 'Ratish' });
        const expectedResult = [{ id: 2, name: 'Ratish' }];
        t.deepEqual(
            result,
            expectedResult,
            'Must update instructor by id'
        )
    }
)

test.serial('deleteInstructorById > Deletes value of instructor by id',
    async (t) => {
        await instructorModel.insertInstructor(1, 'Sampat');
        const result = await instructorModel.deleteInstructorById(1)
        const expectedResult = [{ id: 1, name: 'Sampat' }];
        t.deepEqual(
            result,
            expectedResult,
            'Must delete instructor by id'
        )
    }
)