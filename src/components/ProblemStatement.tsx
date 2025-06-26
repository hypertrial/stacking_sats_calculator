import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const ProblemStatement: React.FC = () => {
  return (
    <div className="problem-statement">
      <div className="problem-content">
        <h1>Mathematical Deep Dive</h1>
        <h2 style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '2rem' }}>
          For the Quants
        </h2>

        <p>
          Let <InlineMath math="N" /> be the number of days in one accumulation cycle (12 months).
          Our total investment budget is normalized to 1 and allocated over these{' '}
          <InlineMath math="N" /> days using a vector of daily weights{' '}
          <InlineMath math="\mathbf{w} = (w_1, w_2, \ldots, w_N)" />.
        </p>

        <p>Each weight must satisfy the following:</p>

        <div className="math-block">
          <BlockMath math="w_i \geq \text{MIN\_WEIGHT} = 10^{-5}, \quad \sum_{i=1}^N w_i = 1" />
        </div>

        <p>
          This guarantees a strictly positive allocation every day, avoiding zero-buys while
          respecting the full budget constraint.
        </p>

        <hr />

        <h3>Uniform DCA (Baseline)</h3>

        <p>(Daily) Uniform Dollar Cost Averaging corresponds to equal allocation on each day:</p>

        <div className="math-block">
          <BlockMath math="w_i^{\text{uniform}} = \frac{1}{N}, \quad \forall i \in \{1,\ldots,N\}" />
        </div>

        <p>This forms the baseline that your model aims to consistently outperform.</p>

        <hr />

        <h3>Dynamic-DCA: Model Definition and Optimization Objective</h3>

        <p>
          The objective of this challenge is to build an optimal <strong>data-driven model</strong>{' '}
          that generates a valid allocation vector over the accumulation cycle and improves upon
          uniform DCA.
        </p>

        <p>A valid model is a function:</p>

        <div className="math-block">
          <BlockMath math="f(\text{features}) \mapsto \mathbf{w} \in \mathrm{int}\,\Delta^{N-1}" />
        </div>

        <p>where:</p>
        <ul>
          <li>
            <strong>Features</strong> are observable inputs derived from available features
          </li>
          <li>
            <InlineMath math="\mathbf{w}" /> is a vector of daily allocation weights
          </li>
          <li>
            The output <InlineMath math="\mathbf{w}" /> must satisfy the following constraints:
          </li>
        </ul>

        <div className="math-block">
          <BlockMath math="\mathrm{int}\,\Delta^{N-1} = \left\{ \mathbf{w} \in \mathbb{R}^N \,\middle|\, w_i \geq 10^{-5},\; \sum_{i=1}^N w_i = 1 \right\}" />
        </div>

        <p>This is the (clipped) probability simplex, which ensures:</p>
        <ul>
          <li>
            <strong>Strictly positive daily purchases</strong>:{' '}
            <InlineMath math="w_i \geq 10^{-5}" />
          </li>
          <li>
            <strong>Full budget utilization</strong>: <InlineMath math="\sum_i w_i = 1" />
          </li>
        </ul>

        <p>
          The model must use <strong>only current and past data</strong>—no future information is
          allowed. This ensures the strategy is deployable in real time and avoids overfitting.
        </p>

        <hr />

        <h3>Final Model Score</h3>

        <p>We score each strategy by:</p>

        <div className="math-block">
          <BlockMath math="\text{Score}(\mathbf{w}) = 0.5 \times \text{RW\_spd\_pct}(\mathbf{w}) + 0.5 \times \text{WinRate}(\mathbf{w})" />
        </div>

        <p>where</p>

        <ul>
          <li>
            <strong>Recency-Weighted SPD Percentile</strong>:
            <div className="math-block">
              <BlockMath math="\text{RW\_spd\_pct}(\mathbf{w}) = \sum_{i=0}^{N-1} w_i \times \text{spd\_pct}_i" />
              <BlockMath math="w_i = \frac{\rho^{N-1-i}}{\sum_{j=0}^{N-1} \rho^{N-1-j}}" />
            </div>
            <ul>
              <li>
                <InlineMath math="0 < \rho < 1" /> is the decay rate (e.g.{' '}
                <InlineMath math="\rho=0.9" />)
              </li>
              <li>
                <InlineMath math="N" /> is the total number of rolling windows (e.g. 4,750)
              </li>
              <li>
                The <InlineMath math="w_i" /> sum to 1, shifting emphasis to more recent windows
              </li>
            </ul>
            <p>and</p>
            <div className="math-block">
              <BlockMath math="\text{spd\_pct}_i = \frac{\text{SPD}_i - \text{worst\_SPD}_i}{\text{best\_SPD}_i - \text{worst\_SPD}_i} \times 100" />
            </div>
          </li>
          <li>
            <strong>Win Rate</strong> (indicator sum):
            <div className="math-block">
              <BlockMath math="\text{WinRate}(\mathbf{w}) = \frac{1}{M} \times \sum_{k=1}^{M} \mathbf{1}(\text{spd\_pct}^{(k)}(\mathbf{w}) > \text{spd\_pct}^{(k)}_{\text{DCA}})" />
            </div>
          </li>
        </ul>

        <p>
          Your goal is to build a model that outputs weights <InlineMath math="\mathbf{w}" /> which
          maximize the <strong>Final Model Score</strong>:
        </p>

        <div className="math-block">
          <BlockMath math="\max_f \text{Score}(f(\text{features}))" />
        </div>

        <p>
          That is, based on a set of daily features (BTC price, on-chain metrics, macro data, etc.),
          your model must output a valid weight vector,{' '}
          <InlineMath math="\mathbf{w} \in \mathrm{int}\,\Delta^{N-1}" />, that maximizes our
          combined <strong>recency-weighted percentile</strong> and <strong>win-rate</strong>{' '}
          metric.
        </p>

        <hr />

        <h3>Not Just Optimization — A Valid Predictive Model</h3>

        <p>
          This challenge is <strong>not</strong> about cherry-picking hindsight weights:
        </p>

        <blockquote>
          <p>
            You must build a model that generalizes from observable features to weight allocations{' '}
            <strong>without access to future data</strong>.
          </p>
        </blockquote>

        <p>
          In short, you're solving a constrained optimization <strong>indirectly</strong>, via a
          predictive model that maps today's features to tomorrow's deployable allocation.
        </p>

        <hr />

        <h2>Deeper Dive: Feature-Driven Rules for Dynamic DCA</h2>

        <p>In this framework, a valid strategy (or model) is defined as a deterministic mapping:</p>

        <div className="math-block">
          <BlockMath math="f: \mathcal{X} \to \mathrm{int}\,\Delta^{N-1}" />
        </div>

        <p>where:</p>
        <ul>
          <li>
            <InlineMath math="\mathcal{X}" /> is the space of observable features (derived from our
            data lake)
          </li>
          <li>
            <InlineMath math="\mathrm{int}\,\Delta^{N-1}" /> is the clipped simplex of valid weight
            vectors
          </li>
        </ul>

        <p>
          At each cycle <InlineMath math="t" />, the model receives a feature vector{' '}
          <InlineMath math="\mathbf{x}^{(t)}" /> and outputs a valid allocation vector:
        </p>

        <div className="math-block">
          <BlockMath math="\mathbf{w}^{(t)} = f(\mathbf{x}^{(t)}; \theta)" />
        </div>

        <p>with the constraints:</p>

        <div className="math-block">
          <BlockMath math="w_i^{(t)} \geq 10^{-5}, \quad \sum_{i=1}^N w_i^{(t)} = 1" />
        </div>

        <h3>Formalizing models this way:</h3>

        <ol>
          <li>
            <strong>Avoids hindsight bias.</strong>
            <br />
            Allocations are <strong>functionally generated</strong>, not manually selected after
            seeing prices.
          </li>
          <li>
            <strong>Supports generalization.</strong>
            <br />
            By choosing a parameterized function class (e.g., linear model, decision tree, neural
            net), models can be validated and tuned properly on historical cycles.
          </li>
          <li>
            <strong>Allows reproducibility and comparison.</strong>
            <br />
            All strategies live in the same feasible space. Performance differences reflect model
            and feature quality—not optimization shortcuts.
          </li>
          <li>
            <strong>Encourages structural insight.</strong>
            <br />
            Successful models reveal patterns and structural dynamics in Bitcoin's behavior that
            improve DCA performance beyond uniform allocation.
          </li>
        </ol>

        <p>
          <strong>But it does not enforce the important non-forward looking criteria.</strong>
        </p>

        <h3>Template for Non-Forward Looking Models</h3>

        <p>
          This template builds on the formal definition of a model to outline a recursive Bayesian
          approach for developing models that ensure valid allocations while strictly adhering to
          the non-forward looking constraint. In this framework, each update depends only on all
          features observed up to the current day and on the most recent allocation, thereby
          simplifying the state history.
        </p>

        <ul>
          <li>
            <strong>Initialization:</strong>
            <br />
            Begin with a uniform prior over <InlineMath math="N" /> days:
            <div className="math-block">
              <BlockMath math="\mathbf{w}^{(0)} := [1/N, 1/N, \ldots, 1/N] \in \mathrm{int}(\Delta^{N-1})" />
            </div>
            <p>
              The pro of uniform weights is that they sum to 1 by definition. That is no longer the
              case when we have dynamic weights that are being allocated in a non-forward looking
              manner.
            </p>
          </li>
          <li>
            <strong>Iterative Process:</strong>
            <br />
            For each day <InlineMath math="i" />, update the allocation based on the features{' '}
            <InlineMath math="(X_1, X_2, \ldots, X_i)" />
            observed up to that day and on the allocation from the previous day, ensuring that each
            updated weight vector resides in the interior of the probability simplex:
            <div className="math-block">
              <BlockMath math="f(X_1, \mathbf{w}^{(0)}) \mapsto \mathbf{w}_1 \in \mathrm{int}(\Delta^{N-1}) \text{ (@ day 1)}" />
              <BlockMath math="f(X_1, X_2, \mathbf{w}_1) \mapsto \mathbf{w}_2 \in \mathrm{int}(\Delta^{N-1}) \text{ (@ day 2)}" />
              <BlockMath math="\vdots" />
              <BlockMath math="f(X_1, \ldots, X_N, \mathbf{w}_{N-1}) \mapsto \mathbf{w}_N \in \mathrm{int}(\Delta^{N-1}) \text{ (@ day N)}" />
            </div>
          </li>
          <li>
            <strong>Final Allocation:</strong>
            <br />
            Define the final weight vector for the cycle as:
            <div className="math-block">
              <BlockMath math="\mathbf{w} = \mathbf{w}_N \in \mathrm{int}(\Delta^{N-1})" />
            </div>
          </li>
        </ul>

        <h4>Key Properties Ensured by the Template</h4>

        <ul>
          <li>
            <strong>Non-Forward Looking:</strong>
            <br />
            Each update <InlineMath math="f(X_1, \ldots, X_i, \mathbf{w}_{i-1})" /> leverages only
            the features up to the current day and the immediately preceding allocation, strictly
            avoiding any forward-looking information.
          </li>
          <li>
            <strong>Dynamic Budget Management:</strong>
            <br />
            By relying on the most recent weight <InlineMath math="\mathbf{w}_{i-1}" />, the model
            can efficiently re-assess the remaining budget and rebalance allocations as needed, even
            allowing for early termination if too much of the budget is allocated early in the
            process.
          </li>
          <li>
            <strong>Budget Conservation:</strong>
            <br />
            The allocation vector remains on the simplex throughout, always satisfying:
            <div className="math-block">
              <BlockMath math="\sum_{i=1}^N w_i = 1 \text{ and } w_i \geq 10^{-5} \; \forall i" />
            </div>
          </li>
          <li>
            <strong>Adaptability:</strong>
            <br />
            The function <InlineMath math="f" /> can be implemented using various model classes
            (e.g., linear models, decision trees, or neural networks), providing a flexible and
            reproducible framework across different strategies.
          </li>
        </ul>

        <p>
          We recommend using this template as a starting point to ensure your model is not forward
          looking.
        </p>

        <hr />

        <h2>Geometry of the Optimization</h2>

        <p>
          When you optimize raw SPD over the <strong>closed</strong> simplex
        </p>

        <div className="math-block">
          <BlockMath math="\Delta^{N-1} = \{\mathbf{w} \in \mathbb{R}^N \mid w_i \geq 0, \sum_i w_i = 1\}" />
        </div>

        <p>
          the solution is trivially a <strong>vertex</strong>—i.e. put 100% of your budget on the
          single day with the lowest price. In hindsight, that perfectly times the market; in
          practice, with no forward-looking data, it's impossible.
        </p>

        <hr />

        <h3>
          Clipping to the <strong>Open</strong> Simplex
        </h3>

        <p>
          To rule out these "all-in" extremes, we force every weight to be at least{' '}
          <InlineMath math="\varepsilon = 10^{-5}" />:
        </p>

        <div className="math-block">
          <BlockMath math="\mathrm{int}\,\Delta^{N-1} = \{\mathbf{w} \in \mathbb{R}^N \mid w_i \geq \varepsilon, \sum_i w_i = 1\}" />
        </div>

        <ul>
          <li>
            <strong>No degenerate corners</strong>: true vertices are eliminated.
          </li>
          <li>
            <strong>Preserves DCA discipline</strong>: every day gets a non-zero purchase.
          </li>
          <li>
            <strong>Keeps convexity</strong>: any convex blend of two valid{' '}
            <InlineMath math="\mathbf{w}" /> is still valid.
          </li>
        </ul>

        <p>
          This clipped region enforces a <strong>trade-off</strong> between:
        </p>
        <ul>
          <li>Pushing toward low-price days (raw SPD)</li>
          <li>Staying "close" to uniform DCA (diversified purchases)</li>
        </ul>

        <hr />

        <h3>
          Introducing the <strong>Final Model Score</strong>
        </h3>

        <p>Rather than maximize SPD alone, we use:</p>

        <div className="math-block">
          <BlockMath math="\text{Score}(\mathbf{w}) = 0.5 \times \text{RW\_spd\_pct}(\mathbf{w}) + 0.5 \times \text{WinRate}(\mathbf{w})" />
        </div>

        <ul>
          <li>
            <strong>Recency-Weighted SPD Percentile</strong> (affine in{' '}
            <InlineMath math="\mathbf{w}" />
            ):
            <div className="math-block">
              <BlockMath math="\text{RW\_spd\_pct}(\mathbf{w}) = \sum_{i=0}^{N-1} w_i \times \text{spd\_pct}_i" />
            </div>
            ⇒ <strong>Linear</strong> behavior in <InlineMath math="\mathbf{w}" />.
          </li>
          <li>
            <strong>Win Rate</strong> (indicator sum):
            <div className="math-block">
              <BlockMath math="\text{WinRate}(\mathbf{w}) = \frac{1}{M} \times \sum_{k=1}^{M} \mathbf{1}(\text{spd\_pct}^{(k)}(\mathbf{w}) > \text{spd\_pct}^{(k)}_{\text{DCA}})" />
            </div>
            ⇒ <strong>Non-convex</strong>, with <strong>flat plateaus</strong> and{' '}
            <strong>jump discontinuities</strong>.
          </li>
        </ul>

        <hr />

        <h3>The Resulting Landscape</h3>

        <ol>
          <li>
            <strong>Convex Feasible Region</strong>:{' '}
            <InlineMath math="\mathbf{w} \in \mathrm{int}\,\Delta^{N-1}" />
            <br />- Any mixture of valid strategies stays valid.
          </li>
          <li>
            <strong>Non-Convex Objective</strong>
            <ul>
              <li>
                <strong>Flat regions</strong> where WinRate is unchanged.
              </li>
              <li>
                <strong>Sudden jumps</strong> when crossing the DCA benchmark in a window.
              </li>
              <li>
                <strong>Multiple local optima</strong>, no simple analytic guarantee.
              </li>
            </ul>
          </li>
          <li>
            <strong>No Vertex Guarantee</strong>
            <br />- The best <InlineMath math="\mathbf{w}" /> need not lie on (or near) the
            boundary.
          </li>
        </ol>

        <hr />

        <h3>Why This Mechanism Design?</h3>

        <ul>
          <li>
            <strong>Discipline + Diversity</strong>: Clipping enforces daily buys, avoiding
            "all-in."
          </li>
          <li>
            <strong>Balanced Performance</strong>: Score blends <strong>strength</strong> (high
            recent SPD percentile) and <strong>consistency</strong> (beating DCA often).
          </li>
          <li>
            <strong>Deployable Models</strong>: Convex domain ensures any candidate—even a
            mix—remains valid.
          </li>
          <li>
            <strong>Rich Search Terrain</strong>: Non-convexity demands gradient-free or
            evolutionary optimizers to explore plateaus and jumps.
          </li>
        </ul>

        <hr />

        <p>
          By moving from a trivial linear program on the closed simplex to a controlled, convex
          region plus a non-linear Score, we create a <strong>mechanism</strong> that:
        </p>
        <ul>
          <li>
            <strong>Prevents trivial hindsight solutions</strong>,
          </li>
          <li>
            <strong>Encourages disciplined diversification</strong>,
          </li>
          <li>
            <strong>Balances recent gains with consistency</strong>,
          </li>
          <li>
            <strong>Yields a challenging yet deployable optimization problem</strong>
          </li>
        </ul>
        <p>for anyone tackling dynamic DCA strategies.</p>

        <hr />

        <h3>TLDR: Why This Mechanism Design?</h3>

        <p>
          We turn a loose mandate—"accumulate as much Bitcoin as possible over a window"—into a{' '}
          <strong>rigorous, deployable challenge</strong>:
        </p>

        <ul>
          <li>
            <strong>Indirect, Feature-Driven Search</strong>
            <br />
            Students don't hand-craft weight vectors directly. They learn a function,{' '}
            <InlineMath math="f: \text{features} \to \mathbf{w} \in \mathrm{int}\,\Delta^{N-1}" />,
            that must generalize, not over-fit. This extra mapping layer multiplies complexity and
            rewards true predictive insight over backtest hacking.
          </li>
          <li>
            <strong>Discipline + Diversity</strong>
            <br />
            Clipping at <InlineMath math="w_i \geq 10^{-5}" /> guarantees every day gets some
            allocation, avoiding trivial "all-in" corner cases while preserving the convex search
            space.
          </li>
          <li>
            <strong>Balanced, Skeptical Backtests</strong>
            <br />A non-convex <strong>Score</strong> blends
            <ol>
              <li>
                <strong>Recency-Weighted SPD Percentile</strong> (linear in{' '}
                <InlineMath math="\mathbf{w}" />) and
              </li>
              <li>
                <strong>Win Rate</strong> (indicator-based, non-convex)
              </li>
            </ol>
            so that simple over-fit examples are disregarded in favor of strategies that perform
            consistently across time.
          </li>
          <li>
            <strong>Deployable, Convex Domain</strong>
            <br />
            Despite the rugged Score landscape, the <strong>open simplex</strong> remains convex:
            any mix of valid strategies is still valid and deployable in real time.
          </li>
          <li>
            <strong>Crowdsourced Creativity</strong>
            <br />
            With hundreds of students exploring diverse model classes and feature sets, we're
            effectively <strong>brute-forcing</strong> the search in parallel. Top ideas emerge, get
            ensembled, and drive collective progress.
          </li>
          <li>
            <strong>Rich Learning & Impact</strong>
            <br />
            This mechanism design:
            <ul>
              <li>
                Turns a trivial hindsight Linear Program into a compelling non-convex optimization.
              </li>
              <li>Guards against over-confidence in backtests, demanding true generalization.</li>
              <li>
                Provides students with hands-on experience in a real world Bitcoin quant problem.
              </li>
            </ul>
          </li>
        </ul>

        <p>
          By carefully constraining the domain and crafting a composite, non-convex metric, we
          ensure our backtests are <strong>meaningful</strong>, our solutions{' '}
          <strong>deployable</strong>.
        </p>
      </div>
    </div>
  );
};

export default ProblemStatement;
