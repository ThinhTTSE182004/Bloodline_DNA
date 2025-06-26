using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

public partial class BloodlineDnaContext : DbContext
{
    public BloodlineDnaContext()
    {
    }

    public BloodlineDnaContext(DbContextOptions<BloodlineDnaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChooseMethod> ChooseMethods { get; set; }

    public virtual DbSet<CollectionMethod> CollectionMethods { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<DeliveryTask> DeliveryTasks { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<FeedbackResponse> FeedbackResponses { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Sample> Samples { get; set; }

    public virtual DbSet<SampleKit> SampleKits { get; set; }

    public virtual DbSet<SampleTransfer> SampleTransfers { get; set; }

    public virtual DbSet<SampleType> SampleTypes { get; set; }

    public virtual DbSet<ServicePackage> ServicePackages { get; set; }

    public virtual DbSet<ServicePrice> ServicePrices { get; set; }

    public virtual DbSet<ShiftAssignment> ShiftAssignments { get; set; }

    public virtual DbSet<TestType> TestTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<WorkShift> WorkShifts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("name=Default");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChooseMethod>(entity =>
        {
            entity.HasOne(d => d.CollectionMethod).WithMany().HasConstraintName("FK__Choose_me__colle__4E88ABD4");

            entity.HasOne(d => d.ServicePackage).WithMany().HasConstraintName("FK__Choose_me__servi__4D94879B");
        });

        modelBuilder.Entity<CollectionMethod>(entity =>
        {
            entity.HasKey(e => e.CollectionMethodId).HasName("PK__Collecti__1B185E47A744D731");

            entity.Property(e => e.CollectionMethodId).ValueGeneratedNever();

            entity.HasOne(d => d.TestType).WithMany(p => p.CollectionMethods)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Collectio__TestT__47DBAE45");
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.DeliveryId).HasName("PK__Delivery__1C5CF4F5F52704C6");

            entity.HasOne(d => d.Order).WithOne(p => p.Delivery)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery__order___5EBF139D");
        });

        modelBuilder.Entity<DeliveryTask>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Delivery__0492148D78FE34F8");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Manager).WithMany(p => p.DeliveryTaskManagers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___manag__07C12930");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.DeliveryTasks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___order__06CD04F7");

            entity.HasOne(d => d.Staff).WithMany(p => p.DeliveryTaskStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___staff__08B54D69");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8C8E61BC73");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Feedback)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__order___76969D2E");
        });

        modelBuilder.Entity<FeedbackResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId).HasName("PK__Feedback__EBECD89608610AB6");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___feedb__7B5B524B");

            entity.HasOne(d => d.Staff).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___staff__7C4F7684");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962293074715E");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CollectionMethod).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__collecti__5629CD9C");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__customer__5535A963");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__Order_de__3C5A40809795376D");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__medic__5AEE82B9");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__order__59FA5E80");

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__servi__59063A47");
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId).HasName("PK__Particip__4E037806841BACDF");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EAF92E6B54");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payment__order_i__693CA210");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("PK__Permissi__E5331AFAD1DE1CE7");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Result__AFB3C316FE258090");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReportDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithOne(p => p.Result)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Result__order_de__02FC7413");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__760965CCD325466D");

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__permi__3D5E1FD2"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___3C69FB99"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A54635CF912EB");
                        j.ToTable("Role_Permission");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(e => e.SampleId).HasName("PK__samples__84ACF7BAA309FA6F");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__order_d__6477ECF3");

            entity.HasOne(d => d.Participant).WithMany(p => p.Samples).HasConstraintName("FK__samples__partici__619B8048");

            entity.HasOne(d => d.SampleType).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__sample___628FA481");

            entity.HasOne(d => d.Staff).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__staff_i__6383C8BA");
        });

        modelBuilder.Entity<SampleKit>(entity =>
        {
            entity.HasKey(e => e.SampleKitId).HasName("PK__Sample_k__0BEC49D56E2D9B03");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__order__6EF57B66");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__staff__6FE99F9F");
        });

        modelBuilder.Entity<SampleTransfer>(entity =>
        {
            entity.HasKey(e => e.TransferId).HasName("PK__Sample_t__78E6FD330058613E");

            entity.Property(e => e.TransferDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.SampleTransferMedicalStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__medic__0D7A0286");

            entity.HasOne(d => d.Sample).WithMany(p => p.SampleTransfers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__sampl__0E6E26BF");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleTransferStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__staff__0C85DE4D");
        });

        modelBuilder.Entity<SampleType>(entity =>
        {
            entity.HasKey(e => e.SampleTypeId).HasName("PK__Sample_t__52C64896835A5F63");
        });

        modelBuilder.Entity<ServicePackage>(entity =>
        {
            entity.HasKey(e => e.ServicePackageId).HasName("PK__Service___96859327B2574EBA");

            entity.Property(e => e.ServicePackageId).ValueGeneratedNever();
        });

        modelBuilder.Entity<ServicePrice>(entity =>
        {
            entity.HasKey(e => e.ServicePriceId).HasName("PK__Service___B715FBB7B417E9E1");

            entity.Property(e => e.ServicePriceId).ValueGeneratedNever();

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.ServicePrices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Service_p__servi__5165187F");
        });

        modelBuilder.Entity<ShiftAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__ShiftAss__DA891814B5899FA7");

            entity.HasOne(d => d.Shift).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__shift__32E0915F");

            entity.HasOne(d => d.User).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__user___31EC6D26");
        });

        modelBuilder.Entity<TestType>(entity =>
        {
            entity.HasKey(e => e.TestTypeId).HasName("PK__TestType__9BB876469A56248E");

            entity.Property(e => e.TestTypeId).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USERS__B9BE370F77915714");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__USERS__role_id__2F10007B");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__User_pro__AEBB701FCDA66D40");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User_prof__user___398D8EEE");
        });

        modelBuilder.Entity<WorkShift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__WorkShif__7B267220A554438D");

            entity.Property(e => e.ShiftId).ValueGeneratedNever();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
