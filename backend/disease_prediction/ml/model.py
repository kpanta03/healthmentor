# model.py
import numpy as np

class DecisionTreeNode:
    def __init__(self, depth=0, max_depth=None, features_per_split=None):
        self.depth = depth
        self.max_depth = max_depth
        self.features_per_split = features_per_split
        self.left = None
        self.right = None
        self.feature_index = None
        self.threshold = None
        self.predicted_class = None

    def fit(self, X, y, sample_weights=None):
        # If all targets are the same or max depth reached, create leaf node
        if len(set(y)) == 1 or (self.max_depth is not None and self.depth >= self.max_depth):
            self.predicted_class = self._majority_class(y, sample_weights)
            return

        n_samples, n_features = X.shape

        # Select random subset of features for this split
        if self.features_per_split is not None:
            feature_indices = np.random.choice(n_features, self.features_per_split, replace=False)
        else:
            feature_indices = np.arange(n_features)

        best_gini = 1.0
        best_idx, best_thr = None, None

        for feature_idx in feature_indices:
            thresholds = np.unique(X[:, feature_idx])
            for thr in thresholds:
                left_mask = X[:, feature_idx] <= thr
                right_mask = ~left_mask

                if left_mask.sum() == 0 or right_mask.sum() == 0:
                    continue

                gini = self._gini_index(y, left_mask, right_mask, sample_weights)
                if gini < best_gini:
                    best_gini = gini
                    best_idx = feature_idx
                    best_thr = thr

        if best_idx is None:
            self.predicted_class = self._majority_class(y, sample_weights)
            return

        self.feature_index = best_idx
        self.threshold = best_thr

        left_mask = X[:, best_idx] <= best_thr
        right_mask = ~left_mask

        self.left = DecisionTreeNode(depth=self.depth + 1, max_depth=self.max_depth, features_per_split=self.features_per_split)
        self.left.fit(X[left_mask], y[left_mask], None if sample_weights is None else sample_weights[left_mask])

        self.right = DecisionTreeNode(depth=self.depth + 1, max_depth=self.max_depth, features_per_split=self.features_per_split)
        self.right.fit(X[right_mask], y[right_mask], None if sample_weights is None else sample_weights[right_mask])

    def predict(self, X):
        if self.predicted_class is not None:
            return np.array([self.predicted_class] * len(X))

        left_mask = X[:, self.feature_index] <= self.threshold
        y_pred = np.empty(len(X), dtype=int)

        if left_mask.any():
            y_pred[left_mask] = self.left.predict(X[left_mask])
        if (~left_mask).any():
            y_pred[~left_mask] = self.right.predict(X[~left_mask])

        return y_pred

    def _gini_index(self, y, left_mask, right_mask, sample_weights):
        # Calculate weighted Gini impurity for split
        def gini(subset_y, subset_weights):
            if len(subset_y) == 0:
                return 0
            total_weight = np.sum(subset_weights) if subset_weights is not None else len(subset_y)
            classes = np.unique(subset_y)
            impurity = 1.0
            for c in classes:
                if subset_weights is not None:
                    p = np.sum(subset_weights[subset_y == c]) / total_weight
                else:
                    p = np.sum(subset_y == c) / total_weight
                impurity -= p**2
            return impurity

        if sample_weights is not None:
            left_weights = sample_weights[left_mask]
            right_weights = sample_weights[right_mask]
        else:
            left_weights = None
            right_weights = None

        n = len(y) if sample_weights is None else np.sum(sample_weights)

        n_left = len(y[left_mask]) if sample_weights is None else np.sum(left_weights)
        n_right = len(y[right_mask]) if sample_weights is None else np.sum(right_weights)

        gini_left = gini(y[left_mask], left_weights)
        gini_right = gini(y[right_mask], right_weights)

        weighted_gini = (n_left / n) * gini_left + (n_right / n) * gini_right
        return weighted_gini

    def _majority_class(self, y, sample_weights):
        if sample_weights is not None:
            classes = np.unique(y)
            weighted_counts = []
            for c in classes:
                weighted_counts.append(np.sum(sample_weights[y == c]))
            return classes[np.argmax(weighted_counts)]
        else:
            return np.bincount(y).argmax()

class RandomForestClassifierScratch:
    def __init__(self, n_estimators=100, max_depth=None, random_state=None, class_weight=None):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.class_weight = class_weight
        self.trees = []
        self.features_per_split = None

    def fit(self, X, y):
        np.random.seed(self.random_state)
        n_samples, n_features = X.shape
        self.features_per_split = int(np.sqrt(n_features))  # typical heuristic

        # Compute sample weights for class balancing if needed
        if self.class_weight == 'balanced':
            classes, counts = np.unique(y, return_counts=True)
            total = len(y)
            class_weights = {cls: total / (len(classes) * count) for cls, count in zip(classes, counts)}
            sample_weights = np.array([class_weights[label] for label in y])
        else:
            sample_weights = None

        self.trees = []
        for _ in range(self.n_estimators):
            # Bootstrap sampling
            indices = np.random.choice(n_samples, size=n_samples, replace=True)
            X_sample = X[indices]
            y_sample = y[indices]
            sw_sample = sample_weights[indices] if sample_weights is not None else None

            # Initialize tree with feature subsetting
            tree = DecisionTreeNode(max_depth=self.max_depth, features_per_split=self.features_per_split)
            tree.fit(X_sample, y_sample, sw_sample)
            self.trees.append(tree)

    def predict(self, X):
        # Collect predictions from all trees
        tree_preds = np.array([tree.predict(X) for tree in self.trees])
        # Majority vote
        y_pred = []
        for i in range(X.shape[0]):
            # Count votes for sample i
            votes = tree_preds[:, i]
            vals, counts = np.unique(votes, return_counts=True)
            y_pred.append(vals[np.argmax(counts)])
        return np.array(y_pred)

    def predict_proba(self, X):
        # Collect predictions from all trees
        tree_preds = np.array([tree.predict(X) for tree in self.trees])  # shape: (n_trees, n_samples)
        n_samples = X.shape[0]
        classes = np.unique(tree_preds)
        proba = np.zeros((n_samples, len(classes)))

        for i in range(n_samples):
            votes = tree_preds[:, i]
            for j, cls in enumerate(classes):
                proba[i, j] = np.sum(votes == cls) / self.n_estimators

        return proba
