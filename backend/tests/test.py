import pprint
import tempfile
from pathlib import Path

import lm_eval
from lm_eval.models.dummy import DummyLM
from lm_eval.tasks import TaskManager

with tempfile.TemporaryDirectory() as tmp:
    tmp_path = Path(tmp)

    data_path = tmp_path / "toy_shape.jsonl"
    data_path.write_text(
        "\n".join(
            [
                '{"question": "2 + 2?", "choices": ["4", "5"], "answer": 0}',
                '{"question": "Capital of France?", "choices": ["Paris", "Rome"], "answer": 0}',
            ]
        )
    )

    task_path = tmp_path / "toy_shape.yaml"
    task_path.write_text(
        f"""
task: toy_shape
dataset_path: json
dataset_kwargs:
  data_files:
    test: {data_path.as_posix()}
output_type: multiple_choice
test_split: test
doc_to_text: "Question: {{{{question}}}}\\nAnswer:"
doc_to_choice: choices
doc_to_target: "{{{{answer}}}}"
metric_list:
  - metric: acc
    aggregation: mean
    higher_is_better: true
metadata:
  version: 1.0
"""
    )

    task_manager = TaskManager(include_path=tmp_path)

    results = lm_eval.simple_evaluate(
        model=DummyLM(),
        tasks=["toy_shape"],
        task_manager=task_manager,
        num_fewshot=0,
        limit=2,
        log_samples=True,
    )

pprint.pp(results)
# pprint.pp(results.keys())
# pprint.pp(results["results"])
# pprint.pp(results["configs"])
# pprint.pp(results["versions"])
# pprint.pp(results["n-shot"])
# pprint.pp(results["higher_is_better"])
# pprint.pp(results["n-samples"])
