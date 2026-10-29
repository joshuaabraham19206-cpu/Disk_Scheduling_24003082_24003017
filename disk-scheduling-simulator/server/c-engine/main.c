#include "scheduler.h"

static void print_all_json(const SimulationResult *results, int count) {
    printf("{\n");
    printf("  \"engine\": \"Native C Executable (Clang x86_64)\",\n");
    printf("  \"results\": {\n");
    for (int i = 0; i < count; i++) {
        const SimulationResult *res = &results[i];
        printf("    \"%s\": {\n", res->algorithm);
        printf("      \"algorithm\": \"%s\",\n", res->algorithm);
        printf("      \"initial_head\": %d,\n", res->initial_head);
        printf("      \"direction\": %d,\n", res->direction);
        printf("      \"max_tracks\": %d,\n", res->max_tracks);
        printf("      \"scan_boundary\": %s,\n", res->scan_boundary ? "true" : "false");
        printf("      \"count_wraparound\": %s,\n", res->count_wraparound ? "true" : "false");
        printf("      \"total_movement\": %d,\n", res->total_movement);
        printf("      \"average_movement\": %.2f,\n", res->average_movement);

        printf("      \"sequence\": [");
        for (int j = 0; j < res->sequence_count; j++) {
            printf("%d%s", res->sequence[j], (j + 1 < res->sequence_count) ? ", " : "");
        }
        printf("],\n");

        printf("      \"steps\": [\n");
        for (int j = 0; j < res->step_count; j++) {
            const StepDetail *s = &res->steps[j];
            printf("        {\n");
            printf("          \"step\": %d,\n", j + 1);
            printf("          \"from\": %d,\n", s->from);
            printf("          \"to\": %d,\n", s->to);
            printf("          \"distance\": %d,\n", s->distance);
            printf("          \"cumulative_distance\": %d,\n", s->cumulative_distance);
            printf("          \"is_wraparound\": %s,\n", s->is_wraparound ? "true" : "false");
            printf("          \"reason\": \"%s\"\n", s->reason);
            printf("        }%s\n", (j + 1 < res->step_count) ? "," : "");
        }
        printf("      ]\n");
        printf("    }%s\n", (i + 1 < count) ? "," : "");
    }
    printf("  }\n");
    printf("}\n");
}

int main(int argc, char *argv[]) {
    if (argc < 7) {
        fprintf(stderr, "Usage: %s <ALGO|--all> <initial_head> <direction> <max_tracks> <scan_boundary> <count_wraparound> [req1 req2 ...]\n", argv[0]);
        return 1;
    }

    const char *algo = argv[1];
    int initial_head = atoi(argv[2]);
    int direction = atoi(argv[3]);
    int max_tracks = atoi(argv[4]);
    int scan_boundary = atoi(argv[5]);
    int count_wraparound = atoi(argv[6]);

    int num_requests = argc - 7;
    int *requests = NULL;
    if (num_requests > 0) {
        requests = (int *)malloc(sizeof(int) * num_requests);
        for (int i = 0; i < num_requests; i++) {
            requests[i] = atoi(argv[7 + i]);
        }
    }

    if (strcmp(algo, "--all") == 0 || strcmp(algo, "ALL") == 0) {
        SimulationResult results[6];
        run_fcfs(requests, num_requests, initial_head, &results[0]);
        run_sstf(requests, num_requests, initial_head, &results[1]);
        run_scan(requests, num_requests, initial_head, direction, max_tracks, scan_boundary, &results[2]);
        run_cscan(requests, num_requests, initial_head, direction, max_tracks, count_wraparound, &results[3]);
        run_look(requests, num_requests, initial_head, direction, &results[4]);
        run_clook(requests, num_requests, initial_head, direction, count_wraparound, &results[5]);

        print_all_json(results, 6);
    } else {
        SimulationResult res;
        if (strcmp(algo, "FCFS") == 0) {
            run_fcfs(requests, num_requests, initial_head, &res);
        } else if (strcmp(algo, "SSTF") == 0) {
            run_sstf(requests, num_requests, initial_head, &res);
        } else if (strcmp(algo, "SCAN") == 0) {
            run_scan(requests, num_requests, initial_head, direction, max_tracks, scan_boundary, &res);
        } else if (strcmp(algo, "CSCAN") == 0 || strcmp(algo, "C-SCAN") == 0) {
            run_cscan(requests, num_requests, initial_head, direction, max_tracks, count_wraparound, &res);
        } else if (strcmp(algo, "LOOK") == 0) {
            run_look(requests, num_requests, initial_head, direction, &res);
        } else if (strcmp(algo, "CLOOK") == 0 || strcmp(algo, "C-LOOK") == 0) {
            run_clook(requests, num_requests, initial_head, direction, count_wraparound, &res);
        } else {
            fprintf(stderr, "Unknown algorithm: %s\n", algo);
            if (requests) free(requests);
            return 2;
        }

        print_result_json(&res);
    }

    if (requests) free(requests);
    return 0;
}
