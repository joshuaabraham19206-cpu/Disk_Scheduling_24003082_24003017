#include "scheduler.h"

void init_result(SimulationResult *res, const char *algo, int initial_head, int direction, int max_tracks, int scan_boundary, int count_wraparound) {
    memset(res, 0, sizeof(SimulationResult));
    strncpy(res->algorithm, algo, sizeof(res->algorithm) - 1);
    res->initial_head = initial_head;
    res->direction = direction;
    res->max_tracks = max_tracks;
    res->scan_boundary = scan_boundary;
    res->count_wraparound = count_wraparound;
    res->sequence_count = 0;
    res->step_count = 0;
    res->total_movement = 0;
    res->average_movement = 0.0;
    
    // Initial head is step 0 in sequence
    res->sequence[res->sequence_count++] = initial_head;
}

void add_step(SimulationResult *res, int from, int to, int is_wraparound, const char *reason) {
    if (res->step_count >= MAX_STEPS) return;

    int dist = abs(to - from);
    int step_idx = res->step_count;
    res->steps[step_idx].from = from;
    res->steps[step_idx].to = to;
    res->steps[step_idx].distance = dist;
    res->steps[step_idx].is_wraparound = is_wraparound;
    strncpy(res->steps[step_idx].reason, reason, sizeof(res->steps[step_idx].reason) - 1);

    if (!is_wraparound || res->count_wraparound) {
        res->total_movement += dist;
    }
    res->steps[step_idx].cumulative_distance = res->total_movement;
    res->step_count++;

    if (res->sequence_count < MAX_STEPS) {
        res->sequence[res->sequence_count++] = to;
    }
}

void print_result_json(const SimulationResult *res) {
    printf("{\n");
    printf("  \"algorithm\": \"%s\",\n", res->algorithm);
    printf("  \"initial_head\": %d,\n", res->initial_head);
    printf("  \"direction\": %d,\n", res->direction);
    printf("  \"max_tracks\": %d,\n", res->max_tracks);
    printf("  \"scan_boundary\": %s,\n", res->scan_boundary ? "true" : "false");
    printf("  \"count_wraparound\": %s,\n", res->count_wraparound ? "true" : "false");
    printf("  \"total_movement\": %d,\n", res->total_movement);
    printf("  \"average_movement\": %.2f,\n", res->average_movement);

    printf("  \"sequence\": [");
    for (int i = 0; i < res->sequence_count; i++) {
        printf("%d%s", res->sequence[i], (i + 1 < res->sequence_count) ? ", " : "");
    }
    printf("],\n");

    printf("  \"steps\": [\n");
    for (int i = 0; i < res->step_count; i++) {
        const StepDetail *s = &res->steps[i];
        printf("    {\n");
        printf("      \"step\": %d,\n", i + 1);
        printf("      \"from\": %d,\n", s->from);
        printf("      \"to\": %d,\n", s->to);
        printf("      \"distance\": %d,\n", s->distance);
        printf("      \"cumulative_distance\": %d,\n", s->cumulative_distance);
        printf("      \"is_wraparound\": %s,\n", s->is_wraparound ? "true" : "false");
        printf("      \"reason\": \"%s\"\n", s->reason);
        printf("    }%s\n", (i + 1 < res->step_count) ? "," : "");
    }
    printf("  ]\n");
    printf("}\n");
}
