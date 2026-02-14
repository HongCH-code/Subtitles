# Subtitles 影片字幕產生器 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based video-to-subtitle web app using Whisper WASM, supporting Chinese and English, outputting SRT and plain text.

**Architecture:** Pure frontend SPA using Vite + vanilla JS. FFmpeg WASM extracts audio from video, Transformers.js (Whisper) performs speech recognition in a Web Worker. No backend required.

**Tech Stack:** Vite, vanilla HTML/CSS/JS, @ffmpeg/ffmpeg, @huggingface/transformers (Whisper ONNX), Web Workers.
