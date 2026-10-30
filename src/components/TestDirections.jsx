// Bluebook'dagi bo'lim yo'riqnomalari (rasmiy matn, inglizcha).

function RwDirections() {
  return (
    <p>
      The questions in this section address a number of important reading and writing skills. Each question
      includes one or more passages, which may include a table or graph. Read each passage and question carefully,
      and then choose the best answer to the question based on the passage(s).
      <br />
      <br />
      All questions in this section are multiple-choice with four answer choices. Each question has a single best
      answer.
    </p>
  );
}

function MathDirections() {
  return (
    <>
      <p>
        The questions in this section address a number of important math skills.
        <br />
        <br />
        Use of a calculator is permitted for all questions. A reference sheet, calculator, and these directions can
        be accessed throughout the test.
      </p>
      <p className="mt-4 font-semibold">Unless otherwise indicated:</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>All variables and expressions represent real numbers.</li>
        <li>Figures provided are drawn to scale.</li>
        <li>All figures lie in a plane.</li>
        <li>
          The domain of a given function <i>f</i> is the set of all real numbers <i>x</i> for which <i>f</i>(
          <i>x</i>) is a real number.
        </li>
      </ul>
      <p className="mt-4">
        For <b>multiple-choice questions</b>, solve each problem and choose the correct answer from the choices
        provided. Each multiple-choice question has a single correct answer.
      </p>
      <p className="mt-3">
        For <b>student-produced response questions</b>, solve each problem and enter your answer as described below.
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>If you find more than one correct answer, enter only one answer.</li>
        <li>
          You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative
          sign) for a negative answer.
        </li>
        <li>If your answer is a fraction that doesn&apos;t fit in the provided space, enter the decimal equivalent.</li>
        <li>
          If your answer is a decimal that doesn&apos;t fit in the provided space, enter it by truncating or rounding
          at the fourth digit.
        </li>
        <li>
          If your answer is a mixed number (such as 3&frac12;), enter it as an improper fraction (7/2) or its decimal
          equivalent (3.5).
        </li>
        <li>Don&apos;t enter symbols such as a percent sign, comma, or dollar sign.</li>
      </ul>
    </>
  );
}

function GenericDirections() {
  return (
    <p>
      Read each question carefully and choose the best answer. You can move between questions with Back and Next,
      mark questions for review, and check your work before you submit the module.
    </p>
  );
}

export default function TestDirections({ type }) {
  if (type === "rw") return <RwDirections />;
  if (type === "math") return <MathDirections />;
  return <GenericDirections />;
}
