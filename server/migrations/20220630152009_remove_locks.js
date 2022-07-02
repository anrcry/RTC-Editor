/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('documents', (table) => {
        table.dropForeign('lockUser');
        table.dropColumn('lockUser');
        table.dropColumn('lockTime');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('documents', (table) => {
        table.string('lockUser');
        table.datetime('lockTime');
        table.foreign('lockUser').references('users.username').onDelete('SET NULL').onUpdate('CASCADE');
      });
};
