/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('keys', (table) => {
        table.string('document').notNullable();
        table.datetime('created').notNullable();
        table.string('key').notNullable();
        table.primary(['document', 'created']);
        table.foreign('document').references('documents.uuid');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('keys');
};
