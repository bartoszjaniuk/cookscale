-- migration: add_icon_to_categories
-- purpose: add icon column to categories table to store emoji representing each category
-- table: categories
-- notes: non-nullable with a default empty string to avoid breaking existing rows;
--        updated immediately for all 6 seeded categories.

-- add icon column; default to empty string so existing rows are valid
alter table categories
  add column icon text not null default '';

-- set emoji icons for each category
update categories set icon = '🥩' where slug = 'meat';
update categories set icon = '🐟' where slug = 'fish';
update categories set icon = '🥕' where slug = 'vegetables';
update categories set icon = '🫘' where slug = 'legumes';
update categories set icon = '🍞' where slug = 'grains';
update categories set icon = '🧀' where slug = 'dairy';
