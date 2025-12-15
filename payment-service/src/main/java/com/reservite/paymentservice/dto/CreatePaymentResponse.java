package com.reservite.paymentservice.dto;

public record CreatePaymentResponse(
        Long paymentId,
        String paypalOrderId,
        String approvalUrl
) {}
