---
name: Learning to Aggregate on Structured Data
shortname: LTA on Structured Data
date: "2020-04"
read: https://github.com/Cortys/master-thesis/raw/master/thesis/build/main.pdf
repo: https://github.com/Cortys/master-thesis
---

This thesis describes the research field of graph classification and regression from the perspective of the *learning to aggregate* (LTA) problem.
It formally characterizes a selection of state-of-the-art graph kernels and *graph neural networks* (GNNs) as instances of LTA.
Those characterizations are shown to be limited by the way in which they decompose graphs.
To overcome this limitation, an avenue for a more “LTA-like” GNN is provided in form of so-called <em>learned edge filters</em>.
To realize edge filters, the novel 2-WL-GNN model is proposed; it is inspired by the two-dimensional *Weisfeiler-Lehman* (WL) algorithm and proven to be strictly more expressive than existing GNN approaches which are bounded by the more restrictive one-dimensional WL algorithm.
