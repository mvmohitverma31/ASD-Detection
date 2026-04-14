import matplotlib.pyplot as plt
import numpy as np

# Define the models and their corresponding accuracies (or other performance metric)
# Ensuring the Hybrid Model has the highest value as requested
models = ['ID3', 'CART', 'Random Forest', 'Hybrid Model']
accuracies = [83.5, 87.2, 93.8, 97.5]  # Example accuracy percentages

# Set up the figure and axis
plt.figure(figsize=(10, 6))

# Define colors for the bars, making the Hybrid Model stand out
colors = ['#4C72B0', '#55A868', '#C44E52', '#8172B3']

# Create the bar chart
bars = plt.bar(models, accuracies, color=colors, width=0.6, edgecolor='black')

# Add text annotations on top of each bar
for bar in bars:
    height = bar.get_height()
    plt.text(
        bar.get_x() + bar.get_width() / 2, 
        height + 1, 
        f'{height}%', 
        ha='center', 
        va='bottom', 
        fontweight='bold',
        fontsize=12
    )

# Customize the plot
plt.title('Performance Comparison of ML Models', fontsize=16, fontweight='bold', pad=15)
plt.xlabel('Machine Learning Models', fontsize=14, fontweight='bold', labelpad=10)
plt.ylabel('Accuracy (%)', fontsize=14, fontweight='bold', labelpad=10)

# Set the y-axis limit to give space for the labels
plt.ylim(0, 110)

# Add a grid for easier reading
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Adjust layout to prevent clipping
plt.tight_layout()

# Save the plot as an image and also display it
plt.savefig('model_comparison.png', dpi=300)
print("Plot saved as 'model_comparison.png'")

# Display the plot
plt.show()
