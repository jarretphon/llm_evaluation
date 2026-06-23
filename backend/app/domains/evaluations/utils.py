from lm_eval.tasks import TaskManager
from lm_eval.tasks.manager import Kind

OUTPUT_TYPES = [
    "multiple_choice",
    "loglikelihood_rolling",
    "loglikelihood",
    "generate_until",
]
COMPLETIONS_TYPES = ["multiple_choice", "loglikelihood_rolling", "loglikelihood"]

task_manager = TaskManager()
hella_swag = "hellaswag"
mmlu = "mmlu"

task_config = task_manager.task_index["mmlu_stem_tasks"]

# print(task_config)


def is_task(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.TASK


def is_group(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.GROUP


def is_tag(task_name):
    task_entry = task_manager.task_index[task_name]
    return task_entry.kind == Kind.TAG


def require_completions(task_name):
    task_entry = task_manager.task_index[task_name]
    output_type = task_entry.cfg["output_type"]
    return output_type in COMPLETIONS_TYPES


# def get_group_tasks(group_name: str, task_manager: TaskManager) -> list[str]:
#     """Recursively get leaf tasks for a given group."""

#     index = task_manager.task_index

#     if group_name not in index:
#         return []

#     entry = index[group_name]

#     if entry.kind == Kind.TASK:
#         return [group_name]

#     else:
#         sub_tasks = []

#         if entry.kind == Kind.GROUP:
#             group_items = entry.cfg.get("task", [])

#         elif entry.kind == Kind.TAG:
#             group_items = entry.tags

#         for item in group_items:
#             sub_tasks.extend(get_group_tasks(item, task_manager))

#         return sub_tasks


# def get_group_tasks(group_name: str, task_manager: TaskManager) -> list[str]:
#     """Recursively get leaf tasks for a given group, handling nested inline group dictionaries."""

#     index = task_manager.task_index

#     # 1. Base Case: Handle safe exits for missing tasks/groups
#     if group_name not in index:
#         return []

#     entry = index[group_name]

#     # 2. Base Case: If it is a leaf task, return its name immediately
#     if entry.kind == Kind.TASK:
#         return [group_name]

#     sub_tasks = []
#     group_items = []

#     # 3. Extract items from standard groups
#     if entry.kind == Kind.GROUP:
#         tasks_field = entry.cfg.get("task", [])
#         # Ensure it's a list (handles single-string edge cases)
#         group_items = tasks_field if isinstance(tasks_field, list) else [tasks_field]

#     # 4. Extract items from tag-based groupings
#     elif entry.kind == Kind.TAG:
#         group_items = list(entry.tags)

#     # 5. Process every child item dynamically
#     for item in group_items:
#         # Scenario A: The child is an inline subgroup dictionary (like in blimp_nl)
#         if isinstance(item, dict):
#             # Extract the nested task/sub-group list inside this inline group config
#             nested_tasks = item.get("task", [])
#             nested_list = (
#                 nested_tasks if isinstance(nested_tasks, list) else [nested_tasks]
#             )    sub_tasks.extend(
#                         get_group_tasks(sub_item.get("task", ""), task_manager)
#                     )

#         # Scenario B: The child is a simple reference name string (like in afrimgsm-irokobench)
#         elif isinstance(item, str):
#             sub_tasks.extend(get_group_tasks(item, task_manager))

#     return sub_tasks


def _flatten_task_field(task_field, task_manager: "TaskManager") -> list[str]:
    """Recursively processes and flattens arbitrarily nested task fields (strings/dicts/lists)."""
    # Case 1: Empty or missing field
    if not task_field:
        return []

    # Case 2: A simple task or group reference string
    if isinstance(task_field, str):
        return get_group_tasks(task_field, task_manager)

    # Case 3: A configuration dictionary (handles inline subgroups at any depth)
    if isinstance(task_field, dict):
        nested_tasks = task_field.get("task", [])
        return _flatten_task_field(nested_tasks, task_manager)

    # Case 4: An iterable list of items (could mix strings and dictionaries)
    if isinstance(task_field, list):
        leaves = []
        for item in task_field:
            leaves.extend(_flatten_task_field(item, task_manager))
        return leaves

    return []


def get_group_tasks(group_name: str, task_manager: "TaskManager") -> list[str]:
    """Recursively get leaf tasks for a given group, handling infinite depth configurations."""
    index = task_manager.task_index

    # Base Case: Handle safe exits for missing tasks/groups
    if group_name not in index:
        return []

    entry = index[group_name]

    # Base Case: If it is a leaf task, return its name immediately
    if entry.kind == Kind.TASK:
        return [group_name]

    sub_tasks = []

    # Scenario A: Standard Group or Inline Macro Benchmark
    if entry.kind == Kind.GROUP:
        tasks_field = entry.cfg.get("task", []) if entry.cfg else []
        sub_tasks.extend(_flatten_task_field(tasks_field, task_manager))

    # Scenario B: Tag collections
    elif entry.kind == Kind.TAG:
        if hasattr(entry, "tags") and entry.tags:
            for tag_item in entry.tags:
                sub_tasks.extend(_flatten_task_field(tag_item, task_manager))

    return sub_tasks


# def get_benchmarks(task_manager: TaskManager) -> list[str]:
#     """Get all benchmarks (groups) from the task manager."""
#     benchmarks = {}
#     for task_name, entry in task_manager.task_index.items():
#         if


def is_standalone_task(entry):

    if entry.kind != Kind.TASK:
        return False

    if entry.cfg.get("tag") is None:
        return False

    return entry.name == entry.cfg.get("task") and set(entry.cfg.get("tag")).issubset(
        set(OUTPUT_TYPES)
    )


# def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
#     """Get all standalone tasks (not part of any group) from the task manager."""
#     standalone_tasks = []

#     for task_name, entry in task_manager.task_index.items():
#         if is_standalone_task(entry):
#             standalone_tasks.append(task_name)
#     return standalone_tasks


# def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
#     """Get all standalone tasks (not part of any group) from the task manager."""
#     standalone_tasks = []

#     for task_name, entry in task_manager.task_index.items():
#         if is_standalone_task(entry):
#             standalone_tasks.append(task_name)

#     return standalone_tasks


def get_standalone_tasks(task_manager: TaskManager) -> list[str]:
    """Get all standalone tasks (not part of any group) from the task manager."""
    groups = task_manager.all_groups
    tags = task_manager.all_tags
    group_sub_tasks = []

    for group in groups:
        group_sub_tasks.extend(get_group_tasks(group, task_manager))

    for tag in tags:
        group_sub_tasks.extend(get_group_tasks(tag, task_manager))

    print(len(set(group_sub_tasks)))
    subtasks = task_manager.all_subtasks

    # get difference between subtasks and group_sub_tasks
    standalone_tasks = list(set(subtasks) - set(group_sub_tasks))

    return standalone_tasks


# print(len(task_manager.all_tags))
# print(len(task_manager.all_tasks))
# print(len(task_manager.all_subtasks))
# print(len(task_manager.all_groups))

# print(task_manager.all_subtasks)
# print(get_standalone_tasks(task_manager))
# print(len(task_manager.all_subtasks))
# print(len(get_standalone_tasks(task_manager)))
print(task_manager.task_index["mmlu"])
# print(task_manager.task_index["gpqa_diamond_zeroshot"])
# print(get_group_tasks("gpqa", task_manager))

# print(task_manager.all_groups)
# print(task_manager.all_tags)
# print(get_standalone_tasks(task_manager))
# print(get_standalone_tasks(task_manager))
# print(get_group_tasks("afrimgsm-irokobench", task_manager))
# print(len(get_group_tasks("afrimgsm-irokobench", task_manager)))
# print(len(task_manager.all_subtasks))
# print(len(task_manager.all_groups))
# print(len(get_standalone_tasks(task_manager)))
# print(get_group_tasks("mmlu", task_manager))
# print(len(get_group_tasks("mmlu", task_manager)))
# output_types = []
# for task_name, entry in task_manager.task_index.items():
#     # 1. Verify that 'cfg' actually exists and is a valid dictionary


#     if entry.cfg is not None:
#         tags = entry.cfg.get('output_type', None)
#         print(f"Task: {task_name}, output_type: {tags}, kind: {entry.kind}")
#         output_types.append(tags)
#     else:
#         # 2. Handles internal base-templates or unpopulated items safely
#         print(f"Task: {task_name}, output_type: [] (No configuration file loaded)")


# print(set(output_types))


output1 = {
    "aradice": ["AraDiCE"],
    "aclue": ["aclue"],
    "afrobench": [
        "adr",
        "african_flores",
        "african_ntrex",
        "afriqa",
        "afrisenti",
        "afrobench",
        "afrobench_belebele",
        "afrobench_lite",
        "injongointent",
        "mafand",
        "masakhaner",
        "masakhanews",
        "masakhapos",
        "naijarc",
        "nollysenti",
        "openai_mmlu",
        "salt",
        "sib",
        "uhura_arc_easy",
        "xlum",
    ],
    "aexams": ["aexams"],
    "afrimgsm": [
        "afrimgsm-irokobench",
        "afrimgsm_cot-irokobench",
        "afrimgsm_tt-irokobench",
        "afrimgsm_tt_cot-irokobench",
    ],
    "afrimmlu": ["afrimmlu-irokobench", "afrimmlu_tt-irokobench"],
    "afrixnli": ["afrixnli-irokobench", "afrixnli_tt-irokobench"],
    "agieval": ["agieval", "agieval_cn", "agieval_en", "agieval_nous"],
    "arab_culture": ["arab_culture"],
    "arab_culture_completion": ["arab_culture_completion"],
    "arabic_leaderboard_complete": [
        "arabic_leaderboard_arabic_mmlu",
        "arabic_leaderboard_complete",
    ],
    "arabic_leaderboard_light": [
        "arabic_leaderboard_arabic_mmlu_light",
        "arabic_leaderboard_light",
    ],
    "arabicmmlu": ["arabicmmlu"],
    "babilong": ["babilong", "babilong_longctx"],
    "basque_bench": ["basque_bench"],
    "bbh": [
        "bbh",
        "bbh_cot_fewshot",
        "bbh_cot_zeroshot",
        "bbh_fewshot",
        "bbh_zeroshot",
    ],
    "belebele": ["belebele"],
    "bhs": ["bhs_basque", "bhs_hindi", "bhs_swahili"],
    "blimp": ["blimp"],
    "blimp_nl": ["blimp_nl"],
    "cabbq": ["cabbq"],
    "catalan_bench": ["catalan_bench"],
    "ceval": ["ceval-valid"],
    "click": ["click"],
    "cmmlu": ["cmmlu"],
    "code_x_glue": ["code2text"],
    "csatqa": ["csatqa"],
    "darija_bench": [
        "darija_sentiment",
        "darija_summarization",
        "darija_translation",
        "darija_transliteration",
    ],
    "darijammlu": ["darijammlu"],
    "egymmlu": ["egymmlu"],
    "esbbq": ["esbbq"],
    "evalita_llm": [
        "evalita-mp",
        "evalita-mp_gen",
        "evalita-mp_mc",
        "evalita-mp_ner_adg_group",
        "evalita-mp_ner_fic_group",
        "evalita-mp_ner_wn_group",
        "evalita-mp_sum_fp_small",
    ],
    "benchmarks": [
        "flan_held_in",
        "flan_held_out",
        "minerva_math",
        "multimedqa",
        "openllm",
        "pythia",
        "t0_eval",
    ],
    "galician_bench": ["galician_bench"],
    "global_mmlu": [
        "global_mmlu_ar",
        "global_mmlu_bn",
        "global_mmlu_de",
        "global_mmlu_en",
        "global_mmlu_es",
        "global_mmlu_fr",
        "global_mmlu_full_am",
        "global_mmlu_full_ar",
        "global_mmlu_full_bn",
        "global_mmlu_full_cs",
        "global_mmlu_full_de",
        "global_mmlu_full_el",
        "global_mmlu_full_en",
        "global_mmlu_full_es",
        "global_mmlu_full_fa",
        "global_mmlu_full_fil",
        "global_mmlu_full_fr",
        "global_mmlu_full_ha",
        "global_mmlu_full_he",
        "global_mmlu_full_hi",
        "global_mmlu_full_id",
        "global_mmlu_full_ig",
        "global_mmlu_full_it",
        "global_mmlu_full_ja",
        "global_mmlu_full_ko",
        "global_mmlu_full_ky",
        "global_mmlu_full_lt",
        "global_mmlu_full_mg",
        "global_mmlu_full_ms",
        "global_mmlu_full_ne",
        "global_mmlu_full_nl",
        "global_mmlu_full_ny",
        "global_mmlu_full_pl",
        "global_mmlu_full_pt",
        "global_mmlu_full_ro",
        "global_mmlu_full_ru",
        "global_mmlu_full_si",
        "global_mmlu_full_sn",
        "global_mmlu_full_so",
        "global_mmlu_full_sr",
        "global_mmlu_full_sv",
        "global_mmlu_full_sw",
        "global_mmlu_full_te",
        "global_mmlu_full_tr",
        "global_mmlu_full_uk",
        "global_mmlu_full_vi",
        "global_mmlu_full_yo",
        "global_mmlu_full_zh",
        "global_mmlu_hi",
        "global_mmlu_id",
        "global_mmlu_it",
        "global_mmlu_ja",
        "global_mmlu_ko",
        "global_mmlu_pt",
        "global_mmlu_sw",
        "global_mmlu_yo",
        "global_mmlu_zh",
    ],
    "global_piqa": ["global_piqa_completions", "global_piqa_prompted"],
    "graphwalks": ["graphwalks"],
    "haerae": ["haerae"],
    "hendrycks_math": ["hendrycks_math"],
    "hrm8k": ["hrm8k", "hrm8k_en"],
    "humaneval_infilling": ["humaneval_infilling"],
    "include": [
        "include_base_44_albanian",
        "include_base_44_albanian_few_shot_en",
        "include_base_44_albanian_few_shot_og",
        "include_base_44_arabic",
        "include_base_44_arabic_few_shot_en",
        "include_base_44_arabic_few_shot_og",
        "include_base_44_armenian",
        "include_base_44_armenian_few_shot_en",
        "include_base_44_armenian_few_shot_og",
        "include_base_44_azerbaijani",
        "include_base_44_azerbaijani_few_shot_en",
        "include_base_44_azerbaijani_few_shot_og",
        "include_base_44_basque",
        "include_base_44_basque_few_shot_en",
        "include_base_44_basque_few_shot_og",
        "include_base_44_belarusian",
        "include_base_44_belarusian_few_shot_en",
        "include_base_44_belarusian_few_shot_og",
        "include_base_44_bengali",
        "include_base_44_bengali_few_shot_en",
        "include_base_44_bengali_few_shot_og",
        "include_base_44_bulgarian",
        "include_base_44_bulgarian_few_shot_en",
        "include_base_44_bulgarian_few_shot_og",
        "include_base_44_chinese",
        "include_base_44_chinese_few_shot_en",
        "include_base_44_chinese_few_shot_og",
        "include_base_44_croatian",
        "include_base_44_croatian_few_shot_en",
        "include_base_44_croatian_few_shot_og",
        "include_base_44_dutch",
        "include_base_44_dutch_few_shot_en",
        "include_base_44_dutch_few_shot_og",
        "include_base_44_estonian",
        "include_base_44_estonian_few_shot_en",
        "include_base_44_estonian_few_shot_og",
        "include_base_44_finnish",
        "include_base_44_finnish_few_shot_en",
        "include_base_44_finnish_few_shot_og",
        "include_base_44_french",
        "include_base_44_french_few_shot_en",
        "include_base_44_french_few_shot_og",
        "include_base_44_georgian",
        "include_base_44_georgian_few_shot_en",
        "include_base_44_georgian_few_shot_og",
        "include_base_44_german",
        "include_base_44_german_few_shot_en",
        "include_base_44_german_few_shot_og",
        "include_base_44_greek",
        "include_base_44_greek_few_shot_en",
        "include_base_44_greek_few_shot_og",
        "include_base_44_hebrew",
        "include_base_44_hebrew_few_shot_en",
        "include_base_44_hebrew_few_shot_og",
        "include_base_44_hindi",
        "include_base_44_hindi_few_shot_en",
        "include_base_44_hindi_few_shot_og",
        "include_base_44_hungarian",
        "include_base_44_hungarian_few_shot_en",
        "include_base_44_hungarian_few_shot_og",
        "include_base_44_indonesian",
        "include_base_44_indonesian_few_shot_en",
        "include_base_44_indonesian_few_shot_og",
        "include_base_44_italian",
        "include_base_44_italian_few_shot_en",
        "include_base_44_italian_few_shot_og",
        "include_base_44_japanese",
        "include_base_44_japanese_few_shot_en",
        "include_base_44_japanese_few_shot_og",
        "include_base_44_kazakh",
        "include_base_44_kazakh_few_shot_en",
        "include_base_44_kazakh_few_shot_og",
        "include_base_44_korean",
        "include_base_44_korean_few_shot_en",
        "include_base_44_korean_few_shot_og",
        "include_base_44_lithuanian",
        "include_base_44_lithuanian_few_shot_en",
        "include_base_44_lithuanian_few_shot_og",
        "include_base_44_malay",
        "include_base_44_malay_few_shot_en",
        "include_base_44_malay_few_shot_og",
        "include_base_44_malayalam",
        "include_base_44_malayalam_few_shot_en",
        "include_base_44_malayalam_few_shot_og",
        "include_base_44_nepali",
        "include_base_44_nepali_few_shot_en",
        "include_base_44_nepali_few_shot_og",
        "include_base_44_north macedonian",
        "include_base_44_north macedonian_few_shot_en",
        "include_base_44_north macedonian_few_shot_og",
        "include_base_44_persian",
        "include_base_44_persian_few_shot_en",
        "include_base_44_persian_few_shot_og",
        "include_base_44_polish",
        "include_base_44_polish_few_shot_en",
        "include_base_44_polish_few_shot_og",
        "include_base_44_portuguese",
        "include_base_44_portuguese_few_shot_en",
        "include_base_44_portuguese_few_shot_og",
        "include_base_44_russian",
        "include_base_44_russian_few_shot_en",
        "include_base_44_russian_few_shot_og",
        "include_base_44_serbian",
        "include_base_44_serbian_few_shot_en",
        "include_base_44_serbian_few_shot_og",
        "include_base_44_spanish",
        "include_base_44_spanish_few_shot_en",
        "include_base_44_spanish_few_shot_og",
        "include_base_44_tagalog",
        "include_base_44_tagalog_few_shot_en",
        "include_base_44_tagalog_few_shot_og",
        "include_base_44_tamil",
        "include_base_44_tamil_few_shot_en",
        "include_base_44_tamil_few_shot_og",
        "include_base_44_telugu",
        "include_base_44_telugu_few_shot_en",
        "include_base_44_telugu_few_shot_og",
        "include_base_44_turkish",
        "include_base_44_turkish_few_shot_en",
        "include_base_44_turkish_few_shot_og",
        "include_base_44_ukrainian",
        "include_base_44_ukrainian_few_shot_en",
        "include_base_44_ukrainian_few_shot_og",
        "include_base_44_urdu",
        "include_base_44_urdu_few_shot_en",
        "include_base_44_urdu_few_shot_og",
        "include_base_44_uzbek",
        "include_base_44_uzbek_few_shot_en",
        "include_base_44_uzbek_few_shot_og",
        "include_base_44_vietnamese",
        "include_base_44_vietnamese_few_shot_en",
        "include_base_44_vietnamese_few_shot_og",
    ],
    "infinitebench": ["infinitebench"],
    "japanese_leaderboard": ["japanese_leaderboard"],
    "jfinqa": ["jfinqa"],
    "kmmlu": [
        "kmmlu",
        "kmmlu_cot_hard",
        "kmmlu_direct",
        "kmmlu_direct_hard",
        "kmmlu_hard",
    ],
    "kobest": ["kobest"],
    "kormedmcqa": ["kormedmcqa"],
    "leaderboard": ["leaderboard", "leaderboard_instruction_following"],
    "libra": [
        "libra_complex_reasoning_and_mathematical_problems",
        "libra_multi_hop_question_answering",
        "libra_question_answering_and_multiple_choice",
        "libra_simple_information_retrieval",
    ],
    "lingoly": ["lingoly"],
    "lm_syneval": ["lm_syneval"],
    "longbench": [
        "longbench",
        "longbench_e",
        "longbench_summarization_e",
        "longbench_synthetic_e",
    ],
    "longbench2": [
        "longbench2",
        "longbench2_history",
        "longbench2_incontext",
        "longbench2_multi",
        "longbench2_single",
        "longbench2_structured",
    ],
    "med_concepts_qa": ["med_concepts_qa"],
    "mela": ["mela"],
    "metabench": [
        "metabench",
        "metabench_permute",
        "metabench_secondary",
        "metabench_secondary_permute",
    ],
    "mmlu": [
        "mmlu",
        "mmlu_continuation",
        "mmlu_flan_cot_fewshot",
        "mmlu_flan_cot_zeroshot",
        "mmlu_flan_n_shot_generative",
        "mmlu_flan_n_shot_loglikelihood",
        "mmlu_generative",
    ],
    "llama3": [
        "mmlu_cot_llama",
        "mmlu_de_llama",
        "mmlu_es_llama",
        "mmlu_fr_llama",
        "mmlu_hi_llama",
        "mmlu_it_llama",
        "mmlu_llama",
        "mmlu_pro_llama",
        "mmlu_pt_llama",
        "mmlu_th_llama",
    ],
    "mmlu_pro": ["mmlu_pro"],
    "mmlu-pro-plus": ["mmlu_pro_plus"],
    "mmlu_prox": [
        "mmlu_prox_af",
        "mmlu_prox_ar",
        "mmlu_prox_bn",
        "mmlu_prox_cs",
        "mmlu_prox_de",
        "mmlu_prox_en",
        "mmlu_prox_es",
        "mmlu_prox_fr",
        "mmlu_prox_hi",
        "mmlu_prox_hu",
        "mmlu_prox_id",
        "mmlu_prox_it",
        "mmlu_prox_ja",
        "mmlu_prox_ko",
        "mmlu_prox_lite_af",
        "mmlu_prox_lite_ar",
        "mmlu_prox_lite_bn",
        "mmlu_prox_lite_cs",
        "mmlu_prox_lite_de",
        "mmlu_prox_lite_en",
        "mmlu_prox_lite_es",
        "mmlu_prox_lite_fr",
        "mmlu_prox_lite_hi",
        "mmlu_prox_lite_hu",
        "mmlu_prox_lite_id",
        "mmlu_prox_lite_it",
        "mmlu_prox_lite_ja",
        "mmlu_prox_lite_ko",
        "mmlu_prox_lite_mr",
        "mmlu_prox_lite_ne",
        "mmlu_prox_lite_pt",
        "mmlu_prox_lite_ru",
        "mmlu_prox_lite_sr",
        "mmlu_prox_lite_sw",
        "mmlu_prox_lite_te",
        "mmlu_prox_lite_th",
        "mmlu_prox_lite_uk",
        "mmlu_prox_lite_ur",
        "mmlu_prox_lite_vi",
        "mmlu_prox_lite_wo",
        "mmlu_prox_lite_yo",
        "mmlu_prox_lite_zh",
        "mmlu_prox_lite_zu",
        "mmlu_prox_mr",
        "mmlu_prox_ne",
        "mmlu_prox_pt",
        "mmlu_prox_ru",
        "mmlu_prox_sr",
        "mmlu_prox_sw",
        "mmlu_prox_te",
        "mmlu_prox_th",
        "mmlu_prox_uk",
        "mmlu_prox_ur",
        "mmlu_prox_vi",
        "mmlu_prox_wo",
        "mmlu_prox_yo",
        "mmlu_prox_zh",
        "mmlu_prox_zu",
    ],
    "mmlu-redux": ["mmlu_redux_generative"],
    "mmlu-redux-spanish": ["mmlu_redux_spanish_generative"],
    "mmlusr": ["mmlusr", "mmlusr_answer_only", "mmlusr_question_only"],
    "openai-mmmlu": ["mmmlu"],
    "mmmu": ["mmmu_val"],
    "e2lmc": ["noor", "sciknoweval_mcqa"],
    "paws-x": ["pawsx"],
    "pisa": ["pisa", "pisa_llm_judged"],
    "portuguese_bench": ["portuguese_bench"],
    "ruler": ["ruler"],
    "score": ["score_robustness"],
    "slr_bench": ["slr_bench_group"],
    "spanish_bench": ["spanish_bench"],
    "tinyBenchmarks": ["tinyBenchmarks"],
    "tmlu": ["tmlu"],
    "tmmluplus": ["tmmluplus"],
    "toksuite": ["toksuite", "toksuite_abridged"],
    "turblimp": ["turblimp_core"],
    "ulqa": ["ulqa"],
    "wmdp": ["wmdp"],
    "xcopa": ["xcopa"],
    "xnli": ["xnli"],
    "xstorycloze": ["xstorycloze"],
    "xwinograd": ["xwinograd"],
    "zhoblimp": ["zhoblimp"],
}
