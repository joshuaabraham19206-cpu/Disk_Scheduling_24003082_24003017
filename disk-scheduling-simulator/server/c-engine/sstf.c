#include "scheduler.h"

void run_sstf(const int *requests, int num_requests, int initial_head, SimulationResult *res) {
    init_result(res, "SSTF", initial_head, 1, 0, 0, 1);
    int current_head = initial_head;

    int *serviced = (int *)calloc(num_requests, sizeof(int));
    if (!serviced) return;

    for (int step = 0; step < num_requests; step++) {
        int best_idx = -1;
        int min_dist = 1000000000;

        for (int i = 0; i < num_requests; i++) {
            if (!serviced[i]) {
                int dist = abs(requests[i] - current_head);
                if (dist < min_dist) {
                    min_dist = dist;
                    best_idx = i;
                } else if (dist == min_dist && best_idx != -1) {
                    // Tie-breaker: choose lower track number
                    if (requests[i] < requests[best_idx]) {
                        best_idx = i;
                    }
                }
            }
        }

        if (best_idx != -1) {
            serviced[best_idx] = 1;
            char reason[256];
            snprintf(reason, sizeof(reason), 
                "SSTF: Selected track %d with shortest seek time (distance: %d tracks from head %d)", 
                requests[best_idx], min_dist, current_head);
            add_step(res, current_head, requests[best_idx], 0, reason);
            current_head = requests[best_idx];
        }
    }

    free(serviced);

    if (num_requests > 0) {
        res->average_movement = (double)res->total_movement / num_requests;
    }
}
