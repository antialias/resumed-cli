import fs from "fs";
import request from "superagent";
import chalk from "chalk";
import { join } from "path";
import { resumeJson as example } from "resume-schema";
import getResume from "./get-resume";
import { themeServer } from "./config";
import getTheme from "./get-theme";

async function sendExportHTML({ resume, themeName }) {
  console.log("Requesting theme from server...");
  const url = themeServer + themeName;
  const { text, status } = await request
    .post(url)
    .send({ resume })
    .set("Accept", "application/json");
  if (200 !== status) {
    throw new Error(
      `error ${status} when attempting to render resume using remote theme at ${url}: ${text}`
    );
  }
  return text;
}

export default async function ({ themeName, dir, path }) {
  let resume;
  try {
    resume = await getResume({ path });
  } catch (err) {
    console.log(chalk.yellow("error getting resume from ${path}:"), err);
    console.log(
      chalk.cyan("Using example resume.json from resume-schema instead...")
    );
    resume = example;
  }
  let theme;
  try {
    theme = getTheme({ themeName, resume });
  } catch (err) {
    console.log(
      "theme could not be found locally, falling back to remote theme server"
    );
    return sendExportHTML({ resume, themeName });
  }
  return theme.render(resume);
}
