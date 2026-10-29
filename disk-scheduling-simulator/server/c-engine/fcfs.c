#include "scheduler.h"

void run_fcfs(const int *requests, int num_requests, int initial_head, SimulationResult *res) {
    init_result(res, "FCFS", initial_head, 1, 0, 0, 1);
    int current_head = initial_head;

    for (int i = 0; i < num_requests; i++) {
        char reason[256];
        snprintf(reason, sizeof(reason), "FIFO: Request #%d (track %d) serviced in arrival order", i + 1, requests[i]);
        add_step(res, current_head, requests[i], 0, reason);
        current_head = requests[i];
    }

    if (num_requests > 0) {
        res->average_movement = (double)res->total_movement / num_requests;
    }
}
