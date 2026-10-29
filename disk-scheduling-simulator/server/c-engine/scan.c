#include "scheduler.h"

static int compare_asc(const void *a, const void *b) {
    return (*(const int *)a - *(const int *)b);
}

static int compare_desc(const void *a, const void *b) {
    return (*(const int *)b - *(const int *)a);
}

void run_scan(const int *requests, int num_requests, int initial_head, int direction, int max_tracks, int scan_boundary, SimulationResult *res) {
    init_result(res, "SCAN", initial_head, direction, max_tracks, scan_boundary, 1);

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

    if (direction >= 0) { // Moving HIGH (towards max_tracks - 1)
        // Service requests in right partition (ascending)
        for (int i = 0; i < right_count; i++) {
            snprintf(reason, sizeof(reason), "SCAN: Sweeping high -> serviced track %d", right[i]);
            add_step(res, current_head, right[i], 0, reason);
            current_head = right[i];
        }

        // If scan_boundary is enabled, travel to boundary cylinder before reversing
        if (scan_boundary && left_count > 0 && current_head != max_tracks - 1) {
            snprintf(reason, sizeof(reason), "SCAN: Reached disk upper boundary (cylinder %d); reversing direction to LOW", max_tracks - 1);
            add_step(res, current_head, max_tracks - 1, 0, reason);
            current_head = max_tracks - 1;
        }

        // Now reverse and service left partition (descending)
        for (int i = left_count - 1; i >= 0; i--) {
            snprintf(reason, sizeof(reason), "SCAN: Sweeping low -> serviced track %d", left[i]);
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }
    } else { // Moving LOW (towards 0)
        // Service requests in left partition (descending)
        for (int i = left_count - 1; i >= 0; i--) {
            snprintf(reason, sizeof(reason), "SCAN: Sweeping low -> serviced track %d", left[i]);
            add_step(res, current_head, left[i], 0, reason);
            current_head = left[i];
        }

        // If scan_boundary is enabled, travel to track 0 before reversing
        if (scan_boundary && right_count > 0 && current_head != 0) {
            snprintf(reason, sizeof(reason), "SCAN: Reached disk lower boundary (cylinder 0); reversing direction to HIGH");
            add_step(res, current_head, 0, 0, reason);
            current_head = 0;
        }

        // Now reverse and service right partition (ascending)
        for (int i = 0; i < right_count; i++) {
            snprintf(reason, sizeof(reason), "SCAN: Sweeping high -> serviced track %d", right[i]);
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
