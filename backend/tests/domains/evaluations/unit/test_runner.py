from app.domains.evaluations import runner


def test_run_lm_eval_uses_completions_model(mocker) -> None:
    task_manager = object()
    require_completions = mocker.patch.object(
        runner, "require_completions", return_value=True
    )
    simple_evaluate = mocker.patch.object(
        runner.lm_eval,
        "simple_evaluate",
        return_value={"ok": True},
    )

    result = runner.run_lm_eval(
        base_url="http://localhost:8001/v1",
        model_name="test-model",
        task="toy_task",
        task_manager=task_manager,
    )

    assert result == {"ok": True}
    require_completions.assert_called_once_with("toy_task", task_manager)
    simple_evaluate.assert_called_once_with(
        model="local-completions",
        model_args={
            "model": "test-model",
            "base_url": "http://localhost:8001/v1",
        },
        tasks=["toy_task"],
    )


def test_run_lm_eval_uses_chat_completions_model(mocker) -> None:
    task_manager = object()
    require_completions = mocker.patch.object(
        runner, "require_completions", return_value=False
    )
    simple_evaluate = mocker.patch.object(
        runner.lm_eval,
        "simple_evaluate",
        return_value={"ok": True},
    )

    result = runner.run_lm_eval(
        base_url="http://localhost:8001/v1",
        model_name="test-model",
        task="toy_task",
        task_manager=task_manager,
    )

    assert result == {"ok": True}
    require_completions.assert_called_once_with("toy_task", task_manager)
    simple_evaluate.assert_called_once_with(
        model="local-chat-completions",
        model_args={
            "model": "test-model",
            "base_url": "http://localhost:8001/v1",
        },
        tasks=["toy_task"],
        apply_chat_template=True,
    )
