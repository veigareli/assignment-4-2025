import { test, expect } from "@playwright/test";

function generateRandomTodo(browser: string, testLabel: string) {
  return `TODO for ${browser} ${testLabel} ${Math.random().toString(36).substring(2, 10)}`;
}

async function countTodos(page, browser, testLabel) {
  await page.waitForTimeout(100);
  const todoEntries = await page.locator("ul > li span").allTextContents();
  return todoEntries.filter(todo => todo.includes(browser) && todo.includes(testLabel)).length;
}

test.beforeEach(async ({ page, browserName }, testInfo) => {
  await page.goto("/");

  await page.evaluate(async ({ browserName, testLabel }) => {
    const response = await fetch(`/api/todos`);
    const todos = await response.json();

    for (const todo of todos) {
      if (todo.text.includes(browserName) && todo.text.includes(testLabel)) {
        await fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" });
      }
    }
    await new Promise(res => setTimeout(res, 100));
  }, { browserName, testLabel: testInfo.title });
});

test("should initialize with an empty TODO list", async ({ page, browserName }, testInfo) => {
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(0);
});

test("should allow adding a new TODO entry", async ({ page, browserName }, testInfo) => {
  const uniqueTodo = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", uniqueTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator(`ul > li span`).filter({ hasText: uniqueTodo })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(1);
});

test("should support adding multiple TODO items", async ({ page, browserName }, testInfo) => {
  const firstTask = generateRandomTodo(browserName, testInfo.title);
  const secondTask = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", firstTask);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", secondTask);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator(`ul > li span`).filter({ hasText: firstTask })).toHaveCount(1);
  await expect(page.locator(`ul > li span`).filter({ hasText: secondTask })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(2);
});

test("should enable removing a TODO item", async ({ page, browserName }, testInfo) => {
  const taskOne = generateRandomTodo(browserName, testInfo.title);
  const taskTwo = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", taskOne);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", taskTwo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await page.locator("ul > li")
    .filter({ hasText: taskOne })
    .locator("button")
    .click({ force: true });

  await expect(page.locator(`ul > li span`).filter({ hasText: taskTwo })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(1);
});

test("should confirm correct title on the index page", async ({ page }) => {
  await expect(page.title()).resolves.toMatch("TODO 📃");
});
