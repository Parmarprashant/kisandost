"""
Convolutional Block Attention Module (CBAM)
Woo et al. (ECCV 2018)
Contains Channel Attention Module and Spatial Attention Module.
"""
import math

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class ChannelAttention(nn.Module):
        def __init__(self, in_planes, ratio=16):
            super(ChannelAttention, self).__init__()
            self.avg_pool = nn.AdaptiveAvgPool2d(1)
            self.max_pool = nn.AdaptiveMaxPool2d(1)

            hidden_planes = max(1, in_planes // ratio)
            self.fc1 = nn.Conv2d(in_planes, hidden_planes, 1, bias=False)
            self.relu1 = nn.ReLU()
            self.fc2 = nn.Conv2d(hidden_planes, in_planes, 1, bias=False)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            avg_out = self.fc2(self.relu1(self.fc1(self.avg_pool(x))))
            max_out = self.fc2(self.relu1(self.fc1(self.max_pool(x))))
            out = avg_out + max_out
            return self.sigmoid(out)

    class SpatialAttention(nn.Module):
        def __init__(self, kernel_size=7):
            super(SpatialAttention, self).__init__()
            assert kernel_size in (3, 7), 'kernel size must be 3 or 7'
            padding = 3 if kernel_size == 7 else 1

            self.conv1 = nn.Conv2d(2, 1, kernel_size, padding=padding, bias=False)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            avg_out = torch.mean(x, dim=1, keepdim=True)
            max_out, _ = torch.max(x, dim=1, keepdim=True)
            scale = torch.cat([avg_out, max_out], dim=1)
            scale = self.conv1(scale)
            return self.sigmoid(scale)

    class CBAM(nn.Module):
        """
        CBAM Module: Refines features through Channel and Spatial Attention sequentially.
        """
        def __init__(self, in_planes, ratio=16, kernel_size=7):
            super(CBAM, self).__init__()
            self.ca = ChannelAttention(in_planes, ratio)
            self.sa = SpatialAttention(kernel_size)

        def forward(self, x):
            out = x * self.ca(x)
            out = out * self.sa(out)
            return out
else:
    class CBAM:
        """Fallback representation when PyTorch is not loaded."""
        def __init__(self, in_planes=2048, ratio=16, kernel_size=7):
            self.in_planes = in_planes
            self.ratio = ratio
            self.kernel_size = kernel_size
