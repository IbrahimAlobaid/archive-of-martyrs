from math import ceil


def total_pages(total: int, page_size: int) -> int:
    if page_size <= 0:
        return 1
    return max(1, ceil(total / page_size))
