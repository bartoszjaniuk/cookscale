-- migration: create_enums
-- purpose: define custom enum types used across multiple tables
-- enums: source_enum, calculation_type_enum, direction_enum

-- source_enum: distinguishes system-seeded products from user-added products (post-mvp)
-- 'system' — products seeded from usda, openfoodfacts, and other canonical sources
-- 'user'   — products added by end users (post-mvp, created_by_user_id column active)
create type source_enum as enum ('system', 'user');

-- calculation_type_enum: type of calculation performed
-- 'product' — single product weight/macro conversion
-- 'dish'    — multi-ingredient dish macro calculation via ai
create type calculation_type_enum as enum ('product', 'dish');

-- direction_enum: conversion direction for product-type calculations
-- 'raw_to_cooked'   — user has raw weight, wants cooked equivalent
-- 'cooked_to_raw'   — user has cooked weight, wants raw equivalent
create type direction_enum as enum ('raw_to_cooked', 'cooked_to_raw');
