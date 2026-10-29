#include "scheduler.h"

static int compare_asc(const void *a, const void *b) {
    return (*(const int *)a - *(const int *)b);
}

static int compare_desc(const void *a, const void *b) {
    return (*(const int *)b - *(const int *)a);
}

void run_cscan(const int *requests, int num_requests, int initial_head, int direction, int max_tracks, int count_wraparound, SimulationResult *res) {
    init_result(res, "C-SCAN", initial_head, direction, max_tracks, 1, count_wraparound);

    int *left = (int *)malloc(sizeof(int) * (num_requests + 2));
    int *right = (int *)malloc(sizeof(int) * (num_requests + 2));
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

    if (direction >= 0) { // Forward direction (HIGH)
        // 1. Service requests >= initial_head in ascending order
        for (int i = 0; i < right_count; i++) {
            snprintf(reason, sizeof(reason), "C-SCAN: Forward sweep (high) -> serviced track %d", right[i]);
            add_step(res, current_head, right[i], 0, reason);
            current_head = right[i];
        }

        // 2. If there are requests remaining on the low side, move to upper boundary
        if (left_count > 0) {
            if (current_head != max_tracks - 1) {
                snprintf(reason, sizeof(reason), "C-SCAN: Reached disk upper boundary (cylinder %d)", max_tracks - 1);
                add_step(res, current_head, max_tracks - 1, 0, reason);
                current_head = max_tracks - 1;
            }

            // 3. Jump to track 0 (wraparound)
            snprintf(reason, sizeof(reason), "C-SCAN: Circular jump to opposite boundary (cylinder 0)%s", 
                count_wraparound ? " [counted in seek]" : " [wraparound excluded from seek]");
            add_step(res, current_head, 0, 1, reason);
            current_head = 0;

            // 4. Continue service in forward direction from track 0 upwards
            for (int i = 0; i < left_count; i++) {
                snprintf(reason, sizeof(reason), "C-SCAN: Forward sweep after wrap -> serviced track %d", left[i]);
                add_step(res, current_head, left[i], 0, reason);
                current_head = left[i];
            }
        }
    } else { // Direction LOW
        // 1. Service requests <= initial_head in descending order
        for (int i = left_count - 1; i >= 0; i--) {
            snprintf(reason, sizeof(reason), "C-SCAN: Forward sweep (low) -> serviced track %d", left[i]);
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }

        if (right_count > 0) {
            if (current_head != 0) {
                snprintf(reason, sizeof(reason), "C-SCAN: Reached disk lower boundary (cylinder 0)");
                add_step(res, current_head, 0, 0, reason);
                current_head = 0;
            }

            // Jump to upper boundary
            snprintf(reason, sizeof(reason), "C-SCAN: Circular jump to opposite boundary (cylinder %d)%s", 
                max_tracks - 1, count_wraparound ? " [counted in seek]" : " [wraparound excluded from seek]");
            add_step(res, current_head, max_tracks - 1, 1, reason);
            current_head = max_tracks - 1;

            for (int i = right_count - 1; i >= 0; i--) {
                snprintf(reason, sizeof(reason), "C-SCAN: Forward sweep after wrap -> serviced track %d", right[i]);
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
