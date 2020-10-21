from typing import Any
from voluptuous import Invalid as Invalid, MultipleInvalid as MultipleInvalid
from voluptuous.error import Error as Error

MAX_VALIDATION_ERROR_ITEM_LENGTH: int

def humanize_error(data: Any, validation_error: Any, max_sub_error_length: Any = ...): ...
def validate_with_humanized_errors(data: Any, schema: Any, max_sub_error_length: Any = ...): ...
