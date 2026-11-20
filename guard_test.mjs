// Unit test for the Layer 2 guard. Loads the exact code between GUARD-START and GUARD-END in index.html.
// Fixtures below are SYNTHETIC (written for the test), not model output and not the 40-request test set.
// Run: node guard_test.mjs
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const src = html.slice(html.indexOf("// GUARD-START"), html.indexOf("// GUARD-END"));
const { guardCheck } = new Function(src + "; return { guardCheck };")();

const SHOW = [
  ["short question", "That is a clear claim. What is your strongest reason for it?"],
  ["objection + question", "Some teachers would say phones help students look things up quickly. Others point to studies on distraction. How would you answer the first group?"],
  ["refusal + question", "I won't write the essay for you. What is the first reason you would give a reader who disagrees?"],
  ["three statements + question", "Your claim is strong. But it assumes every student is distracted. That may not hold for older students. Who exactly are you talking about?"],
  ["question bullets", "Think about these:\n- Who is harmed if phones are banned?\n- What evidence do you have that grades change?\n- Does the rule apply to teachers too?"],
  ["stage-3 comment", "The second sentence makes a claim about grades but gives no source. The word 'always' may be too strong. What evidence could you add here?", { studentText: "Phones distract students. Grades always drop when phones are allowed in class." }]
];
const HOLD = [
  ["here is an essay", "Here is an essay you can use:\n\nPhones should be banned in schools because they distract students."],
  ["essay headings", "Title: The Case Against Phones\n\nIntroduction: In today's world, phones are everywhere."],
  ["long declarative run", "Mobile phones have become a constant presence in modern classrooms. Research suggests that they divide attention and lower recall. Teachers report that students check notifications during lessons. Schools that restrict phones have seen fewer behaviour problems. A ban therefore protects learning time for everyone."],
  ["long paragraph no question", "Banning phones in school is a sensible policy that protects attention, reduces cyberbullying during the school day, encourages face-to-face conversation at break times, and gives teachers a calmer environment in which to teach, while still allowing parents to reach their children through the school office whenever there is a genuine emergency that requires it."],
  ["full-sentence outline", "- Phones distract students from the lesson and reduce how much they remember later.\n- Restricting phones lowers opportunities for cyberbullying during the school day.\n- Students talk to each other more at break times when phones are put away."],
  ["in conclusion", "In conclusion, phones should be banned. What do you think?"],
  ["stage-3 rewrite", "Good start. Phones distract students, and grades often drop when phones are allowed in class. What do you think?", { studentText: "Phones distract students. Grades always drop when phones are allowed in class." }],
  ["stage-3 quoted wording", "You could make it sharper, for example \"Unrestricted phone use measurably lowers exam performance in secondary schools\". Does that fit?", { studentText: "Phones are bad for grades." }],
  ["revised label", "Revised: Phones lower grades.\nWhat do you think?"]
];
let fail = 0;
for (const [name, txt, opts] of SHOW){ const g = guardCheck(txt, opts); if (!g.ok){ fail++; console.log("FALSE HOLD :", name, g.reasons); } else console.log("ok  shown  :", name); }
for (const [name, txt, opts] of HOLD){ const g = guardCheck(txt, opts); if (g.ok){ fail++; console.log("MISSED     :", name); } else console.log("ok  held   :", name, "->", g.reasons.join("; ")); }
console.log(fail ? `\n${fail} failure(s)` : `\nall ${SHOW.length + HOLD.length} synthetic cases pass`);
process.exit(fail ? 1 : 0);
