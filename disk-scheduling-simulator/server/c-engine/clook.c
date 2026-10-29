#include "scheduler.h"

static int compare_asc(const void *a, const void *b) {
    return (*(const int *)a - *(const int *)b);
}

void run_clook(const int *requests, int num_requests, int initial_head, int direction, int count_wraparound, SimulationResult *res) {
    init_result(res, "C-LOOK", initial_head, direction, 0, 0, count_wraparound);

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

    if (direction >= 0) { // Forward direction HIGH
        // 1. Service requests >= initial_head ascending
        for (int i = 0; i < right_count; i++) {
            snprintf(reason, sizeof(reason), "C-LOOK: Forward sweep (high) -> serviced track %d", right[i]);
            add_step(res, current_head, right[i], 0, reason);
            current_head = right[i];
        }

        // 2. Jump directly to lowest pending request in left (circular jump, no boundary travel)
        if (left_count > 0) {
            snprintf(reason, sizeof(reason), 
                "C-LOOK: Circular jump directly to lowest pending track %d (avoiding boundary 0)%s", 
                left[0], count_wraparound ? " [counted in seek]" : " [wraparound excluded from seek]");
            add_step(res, current_head, left[0], 1, reason);
            current_head = left[0];

            // 3. Continue forward service from left[1] upwards
            for (int i = 1; i < left_count; i++) {
                snprintf(reason, sizeof(reason), "C-LOOK: Forward sweep after wrap -> serviced track %d", left[i]);
                add_step(res, current_head, left[i], 0, reason);
                current_head = left[i];
            }
        }
    } else { // Direction LOW
        for (int i = left_count - 1; i >= 0; i--) {
            snprintf(reason, sizeof(reason), "C-LOOK: Forward sweep (low) -> serviced track %d", left[i]);
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }

        if (right_count > 0) {
            int last_right = right[right_count - 1];
            snprintf(reason, sizeof(reason), 
                "C-LOOK: Circular jump directly to highest pending track %d%s", 
                last_right, count_wraparound ? " [counted in seek]" : " [wraparound excluded from seek]");
            add_step(res, current_head, last_right, 1, reason);
            current_head = last_right;

            for (int i = right_count - 2; i >= 0; i--) {
                snprintf(reason, sizeof(reason), "C-LOOK: Forward sweep after wrap -> serviced track %d", right[i]);
                add_step(res, current_head, right[i], 0, reason);
                current_head = right[i];
            }
        }
    }

    free(left);
    free(right);

    if (num_requests > 0) {
        res->average_movement = (double)res->total_movement / num_requests;
    }
}
