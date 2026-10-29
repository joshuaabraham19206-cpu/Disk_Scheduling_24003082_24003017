#include "scheduler.h"

static int compare_asc(const void *a, const void *b) {
    return (*(const int *)a - *(const int *)b);
}

void run_look(const int *requests, int num_requests, int initial_head, int direction, SimulationResult *res) {
    init_result(res, "LOOK", initial_head, direction, 0, 0, 1);

    int *left = (int *)malloc(sizeof(int) * num_requests);
    int *right = (int *)malloc(sizeof(int) * num_requests);
    int left_count = 0, right_count = 0;

    for (int i = 0; i < num_requests; i++) {
        if (requests[i] < initial_head) {
            left[left_count++] = requests[i];
        } else {
            right[right_count++] = requests[i];
        }
    }

    qsort(left, left_count, sizeof(int), compare_asc);
    qsort(right, right_count, sizeof(int), compare_asc);

    int current_head = initial_head;
    char reason[256];

    if (direction >= 0) { // Sweeping HIGH
        // 1. Service requests >= initial_head ascending
        for (int i = 0; i < right_count; i++) {
            snprintf(reason, sizeof(reason), "LOOK: Sweeping high -> serviced track %d", right[i]);
            add_step(res, current_head, right[i], 0, reason);
            current_head = right[i];
        }

        // 2. Reverse at last pending request (no boundary traversal)
        if (left_count > 0 && right_count > 0) {
            // Note: the reversal happens naturally at right[right_count-1]
        }

        for (int i = left_count - 1; i >= 0; i--) {
            if (i == left_count - 1 && right_count > 0) {
                snprintf(reason, sizeof(reason), "LOOK: Reversing direction at last request (no boundary trip) -> serviced track %d", left[i]);
            } else {
                snprintf(reason, sizeof(reason), "LOOK: Sweeping low -> serviced track %d", left[i]);
            }
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }
    } else { // Sweeping LOW
        for (int i = left_count - 1; i >= 0; i--) {
            snprintf(reason, sizeof(reason), "LOOK: Sweeping low -> serviced track %d", left[i]);
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }

        for (int i = 0; i < right_count; i++) {
            if (i == 0 && left_count > 0) {
                snprintf(reason, sizeof(reason), "LOOK: Reversing direction at lowest request (no boundary trip) -> serviced track %d", right[i]);
            } else {
                snprintf(reason, sizeof(reason), "LOOK: Sweeping high -> serviced track %d", right[i]);
            }
            add_step(res, current_head, right[i], 0, reason);
            current_head = right[i];
        }
    }

    free(left);
    free(right);

    if (num_requests > 0) {
        res->average_movement = (double)res->total_movement / num_requests;
    }
}
