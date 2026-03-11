import db from './connection.js';

async function migrate() {
  // Create tables in order

  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (t) => {
      t.string('id', 36).primary();
      t.string('email', 255).notNullable().unique();
      t.string('password_hash', 255).notNullable();
      t.string('display_name', 255).notNullable();
      t.string('avatar_url', 500);
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
    });
    console.log('Created: users');
  }

  if (!(await db.schema.hasTable('projects'))) {
    await db.schema.createTable('projects', (t) => {
      t.string('id', 36).primary();
      t.string('name', 255).notNullable();
      t.string('key', 10).notNullable().unique();
      t.text('description');
      t.string('owner_id', 36).notNullable().references('id').inTable('users');
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
    });
    console.log('Created: projects');
  }

  if (!(await db.schema.hasTable('project_members'))) {
    await db.schema.createTable('project_members', (t) => {
      t.string('id', 36).primary();
      t.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
      t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('role', 20).notNullable().defaultTo('member');
      t.timestamp('invited_at').notNullable().defaultTo(db.fn.now());
      t.unique(['project_id', 'user_id']);
    });
    console.log('Created: project_members');
  }

  if (!(await db.schema.hasTable('tickets'))) {
    await db.schema.createTable('tickets', (t) => {
      t.string('id', 36).primary();
      t.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
      t.integer('ticket_number').notNullable();
      t.string('title', 500).notNullable();
      t.text('description');
      t.string('type', 20).notNullable().defaultTo('bug');
      t.string('priority', 20).notNullable().defaultTo('medium');
      t.string('status', 20).notNullable().defaultTo('open');
      t.string('reporter_id', 36).notNullable().references('id').inTable('users');
      t.string('assignee_id', 36).references('id').inTable('users');
      t.string('due_date', 20);
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
      t.unique(['project_id', 'ticket_number']);
      t.index(['project_id', 'status']);
      t.index(['assignee_id']);
    });
    console.log('Created: tickets');
  }

  if (!(await db.schema.hasTable('comments'))) {
    await db.schema.createTable('comments', (t) => {
      t.string('id', 36).primary();
      t.string('ticket_id', 36).notNullable().references('id').inTable('tickets').onDelete('CASCADE');
      t.string('author_id', 36).notNullable().references('id').inTable('users');
      t.text('body').notNullable();
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
      t.index(['ticket_id']);
    });
    console.log('Created: comments');
  }

  if (!(await db.schema.hasTable('attachments'))) {
    await db.schema.createTable('attachments', (t) => {
      t.string('id', 36).primary();
      t.string('ticket_id', 36).notNullable().references('id').inTable('tickets').onDelete('CASCADE');
      t.string('uploader_id', 36).notNullable().references('id').inTable('users');
      t.string('filename', 500).notNullable();
      t.integer('file_size').notNullable();
      t.string('mime_type', 100).notNullable();
      t.string('oss_key', 500).notNullable();
      t.string('oss_url', 1000).notNullable();
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.index(['ticket_id']);
    });
    console.log('Created: attachments');
  }

  if (!(await db.schema.hasTable('labels'))) {
    await db.schema.createTable('labels', (t) => {
      t.string('id', 36).primary();
      t.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
      t.string('name', 100).notNullable();
      t.string('color', 7).notNullable().defaultTo('#6B7280');
      t.unique(['project_id', 'name']);
    });
    console.log('Created: labels');
  }

  if (!(await db.schema.hasTable('ticket_labels'))) {
    await db.schema.createTable('ticket_labels', (t) => {
      t.string('ticket_id', 36).notNullable().references('id').inTable('tickets').onDelete('CASCADE');
      t.string('label_id', 36).notNullable().references('id').inTable('labels').onDelete('CASCADE');
      t.primary(['ticket_id', 'label_id']);
    });
    console.log('Created: ticket_labels');
  }

  if (!(await db.schema.hasTable('activity_logs'))) {
    await db.schema.createTable('activity_logs', (t) => {
      t.string('id', 36).primary();
      t.string('ticket_id', 36).notNullable().references('id').inTable('tickets').onDelete('CASCADE');
      t.string('user_id', 36).notNullable().references('id').inTable('users');
      t.string('action', 50).notNullable();
      t.text('old_value');
      t.text('new_value');
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      t.index(['ticket_id']);
    });
    console.log('Created: activity_logs');
  }

  // --- Migration 10: Add user approval & system role ---
  const userCols = await db.raw("PRAGMA table_info('users')");
  const hasApproved = (userCols as any[]).some((c: any) => c.name === 'approved');
  if (!hasApproved) {
    await db.schema.alterTable('users', (t) => {
      t.boolean('approved').notNullable().defaultTo(false);
      t.string('system_role', 20).notNullable().defaultTo('user'); // 'root' | 'user'
    });
    console.log('Altered: users (added approved, system_role)');
  }

  // --- Migration 11: Add attachment_type to attachments ---
  const attachCols = await db.raw("PRAGMA table_info('attachments')");
  const hasAttachType = (attachCols as any[]).some((c: any) => c.name === 'attachment_type');
  if (!hasAttachType) {
    await db.schema.alterTable('attachments', (t) => {
      t.string('attachment_type', 20).notNullable().defaultTo('file'); // 'file' | 'log'
    });
    console.log('Altered: attachments (added attachment_type)');
  }

  console.log('All migrations complete.');
  await db.destroy();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
