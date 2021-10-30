---
name: Ranking Structured Objects with Graph Neural Networks
shortname: Ranking Structured Objects with GNNs
date: "2021-10"
read: https://arxiv.org/abs/2104.08869
repo: https://github.com/Cortys/rankgnn
---
This paper was published at [Discovery Science 2021](https://ds2021.cs.dal.ca/#accepPapers;blank).

**Abstract:** *Graph neural networks* (GNNs) have been successfully applied in many structured data domains, with applications ranging from molecular property prediction to the analysis of social networks.
Motivated by the broad applicability of GNNs, we propose the family of so-called *RankGNNs*, a combination of neural *Learning to Rank* (LtR) methods and GNNs.
RankGNNs are trained with a set of pair-wise preferences between graphs, suggesting that one of them is preferred over the other.
One practical application of this problem is drug screening, where an expert wants to find the most promising molecules in a large collection of drug candidates.
We empirically demonstrate that our proposed pair-wise RankGNN approach either significantly outperforms or at least matches the ranking performance of the naïve point-wise baseline approach, in which the LtR problem is solved via GNN-based graph regression.
