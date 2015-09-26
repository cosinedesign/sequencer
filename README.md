# sequencer


# Pattern Format

- pattern
  - bars[]
    - bar
      - sequences[]
        - array of steps
          - step             
          - length           (calculated by sequencer)
          - action
            - name
            - options
              - {anything - depends on the action's requirements}

The pattern format should be interpreted into a control format, which flattens the parallel sequences into 'frames' based on starting step:

- 4 bar patterns of 16 steps would become 64 frames

- sequence
  - frame
    - channel
      - action
