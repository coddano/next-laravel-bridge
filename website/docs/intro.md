---
sidebar_position: 1
---

# Introduction

**Next Laravel Bridge** is a complete NPM package that facilitates integration between **Next.js** and **Laravel**.

It provides ready-to-use solutions for:
*   🔐 **Authentication** (Laravel Sanctum)
*   🛡️ **Access Control (ACL)** (Roles & Permissions)
*   📝 **Form Management** (Automatic validation errors)
*   🔍 **Data Fetching** (React Query style)
*   📄 **Pagination** (Standard & Cursor)
*   📁 **File Uploads**
*   🔔 **Notifications** (Toasts)
*   📡 **Broadcasting** (Laravel Echo / WebSockets)

## Why use this bridge?

Connecting a Next.js frontend to a Laravel API often involves repeating the same boilerplate code:
*   Setting up Axios interceptors for CSRF and tokens.
*   Handling validation errors (422) and mapping them to form inputs.
*   Managing auth state (user, login, logout).
*   Implementing pagination logic.

**Next Laravel Bridge** abstracts all this complexity into simple, typed Hooks and Components.
